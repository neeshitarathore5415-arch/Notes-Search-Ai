import "dotenv/config";

import { dirname, join, parse } from "node:path";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { QdrantClient } from "@qdrant/js-client-rest";

type Failure = {
    step: string;
    status?: number;
    url?: string;
    body?: unknown;
};

const COLLECTION_NAME = "notes";
const TEST_COLLECTION_NAME = "test_collection";
const require = createRequire(import.meta.url);
const sdkPackagePath = findPackageJson(require.resolve("@qdrant/js-client-rest"));
const sdkPackage = JSON.parse(readFileSync(sdkPackagePath, "utf8")) as {
    version: string;
};

function findPackageJson(resolvedEntry: string) {
    let directory = dirname(resolvedEntry);
    const root = parse(directory).root;

    while (directory !== root) {
        const packagePath = join(directory, "package.json");

        try {
            const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
                name?: string;
            };

            if (packageJson.name === "@qdrant/js-client-rest") {
                return packagePath;
            }
        } catch {
            // Keep walking toward the package root.
        }

        directory = dirname(directory);
    }

    throw new Error("Could not locate @qdrant/js-client-rest package.json");
}

function normalizeQdrantUrl(rawUrl: string | undefined) {
    if (!rawUrl) {
        throw new Error("QDRANT_URL is not set");
    }

    const url = new URL(rawUrl);

    return url.toString().replace(/\/$/, "");
}

function createClient(url: string, apiKey: string) {
    return new QdrantClient({
        url,
        apiKey,
        checkCompatibility: false,
    });
}

function getSdkRestUrl(url: string) {
    const parsed = new URL(url);

    if (!parsed.port) {
        parsed.port = "6333";
    }

    return parsed.toString().replace(/\/$/, "");
}

function describeError(error: unknown): Omit<Failure, "step"> {
    if (typeof error !== "object" || error === null) {
        return { body: error };
    }

    const candidate = error as {
        status?: number;
        url?: string;
        data?: unknown;
        response?: {
            status?: number;
            url?: string;
            data?: unknown;
        };
        message?: string;
    };

    return {
        status: candidate.status ?? candidate.response?.status,
        url: candidate.url ?? candidate.response?.url,
        body:
            candidate.data ??
            candidate.response?.data ??
            candidate.message ??
            String(error),
    };
}

async function runStep<T>(
    step: string,
    failures: Failure[],
    action: () => Promise<T>
) {
    try {
        const result = await action();
        console.log(`\n[OK] ${step}`);
        console.dir(result, { depth: null });
        return result;
    } catch (error) {
        const failure = { step, ...describeError(error) };
        failures.push(failure);
        console.error(`\n[FAIL] ${step}`);
        console.error(`Request URL: ${failure.url ?? "(not provided by SDK)"}`);
        console.error(`HTTP status: ${failure.status ?? "(not provided)"}`);
        console.error("Response body:");
        console.dir(failure.body, { depth: null });
        return undefined;
    }
}

async function rawRequest(
    url: string,
    apiKey: string,
    path: string,
    init: RequestInit = {}
) {
    const requestUrl = `${url}${path}`;
    const response = await fetch(requestUrl, {
        ...init,
        headers: {
            "api-key": apiKey,
            "content-type": "application/json",
            accept: "application/json",
            ...init.headers,
        },
    });
    const text = await response.text();
    let body: unknown = text;

    try {
        body = text ? JSON.parse(text) : "";
    } catch {
        body = text;
    }

    if (!response.ok) {
        throw {
            status: response.status,
            url: response.url,
            data: body,
        };
    }

    return { status: response.status, url: response.url, body };
}

function diagnose404(failures: Failure[], getCollectionsOk: boolean) {
    const notFoundFailures = failures.filter((failure) => failure.status === 404);

    if (notFoundFailures.length === 0) {
        return;
    }

    console.log("\n[DIAGNOSIS] 404 analysis");

    if (getCollectionsOk) {
        console.log(
            "The Qdrant endpoint, API key, and SDK request shape are working because getCollections() succeeded."
        );
        console.log(
            "Any 404 after that is collection-specific. If getCollection(\"notes\") returned 404, the notes collection does not exist yet."
        );
        return;
    }

    const urls = notFoundFailures
        .map((failure) => failure.url)
        .filter((url): url is string => Boolean(url));

    if (urls.some((url) => url.includes(":6333"))) {
        console.log(
            "The request is hitting :6333 and still returning 404, so the Cloud endpoint or cluster configuration is likely incorrect."
        );
        return;
    }

    console.log(
        `The SDK version is ${sdkPackage.version}. The failing URL does not include :6333; Qdrant JS defaults REST traffic to :6333 when no port is configured.`
    );
}

async function main() {
    const apiKey = process.env.QDRANT_API_KEY;

    if (!apiKey) {
        throw new Error("QDRANT_API_KEY is not set");
    }

    const configuredUrl = process.env.QDRANT_URL;
    const qdrantUrl = normalizeQdrantUrl(configuredUrl);
    const sdkRestUrl = getSdkRestUrl(qdrantUrl);
    const client = createClient(qdrantUrl, apiKey);
    const failures: Failure[] = [];

    console.log(`Qdrant JS SDK version: ${sdkPackage.version}`);
    console.log(`Configured QDRANT_URL: ${configuredUrl}`);
    console.log(`Effective SDK REST URL: ${sdkRestUrl}`);

    const rawCollections = await runStep("raw GET /collections", failures, () =>
        rawRequest(sdkRestUrl, apiKey, "/collections")
    );

    const collections = await runStep("SDK getCollections()", failures, () =>
        client.getCollections()
    );

    const notesCollection = await runStep(`SDK getCollection("${COLLECTION_NAME}")`, failures, () =>
        client.getCollection(COLLECTION_NAME)
    );

    if (collections && notesCollection === undefined) {
        const notesMissing = failures.some(
            (failure) =>
                failure.step === `SDK getCollection("${COLLECTION_NAME}")` &&
                failure.status === 404
        );

        if (notesMissing) {
            await runStep(
                `SDK createCollection("${COLLECTION_NAME}") repair`,
                failures,
                () =>
                    client.createCollection(COLLECTION_NAME, {
                        vectors: {
                            size: 1024,
                            distance: "Cosine",
                        },
                    })
            );
        }
    }

    const createdTestCollection = await runStep(
        `SDK createCollection("${TEST_COLLECTION_NAME}")`,
        failures,
        () =>
            client.createCollection(TEST_COLLECTION_NAME, {
                vectors: {
                    size: 1024,
                    distance: "Cosine",
                },
            })
    );

    if (createdTestCollection !== undefined) {
        await runStep(
            `SDK deleteCollection("${TEST_COLLECTION_NAME}") cleanup`,
            failures,
            () => client.deleteCollection(TEST_COLLECTION_NAME)
        );
    }

    diagnose404(failures, Boolean(rawCollections && collections));

    if (failures.length > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error("\n[UNHANDLED FAILURE]");
    console.error(error);
    process.exitCode = 1;
});
