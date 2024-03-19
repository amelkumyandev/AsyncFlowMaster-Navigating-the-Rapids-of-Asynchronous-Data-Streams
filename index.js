async function processDataAsync(dataSources) {
    const settledPromises = await Promise.allSettled(dataSources.map(source => source()));

    const successfulData = settledPromises
        .filter(result => result.status === 'fulfilled' && validateData(result.value))
        .map(result => result.value);

    return successfulData.reduce(aggregateData, []);
}

// Mock implementation of validateData and aggregateData for testing
function validateData(data) {
    // Assume a simple validation that data objects must have a `valid` property set to true
    return data.valid === true;
}

function aggregateData(resultsArray, newData) {
    return [...resultsArray, newData];
}

// Mock data sources (functions returning Promises)
const dataSource1 = () => Promise.resolve({ id: 1, valid: true });
const dataSource2 = () => Promise.resolve({ id: 2, valid: false });
const dataSource3 = () => Promise.reject(new Error('Source failed'));
const dataSource4 = () => Promise.resolve({ id: 3, valid: true });

// Test cases
const testCases = [
    {
        name: 'All sources succeed, mixed validation',
        sources: [dataSource1, dataSource2, dataSource4],
        expected: [{ id: 1, valid: true }, { id: 3, valid: true }],
    },
    {
        name: 'One source fails, others succeed',
        sources: [dataSource1, dataSource3, dataSource4],
        expected: [{ id: 1, valid: true }, { id: 3, valid: true }],
    },
    {
        name: 'All sources fail',
        sources: [dataSource3],
        expected: [],
    },
];

async function runTestCases() {
    for (let testCase of testCases) {
        try {
            const result = await processDataAsync(testCase.sources);
            const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
            console.log(`Test "${testCase.name}": ${passed ? 'PASSED' : 'FAILED'}`);
        } catch (error) {
            console.log(`Test "${testCase.name}" threw an unexpected error: ${error.message}`);
        }
    }
}

runTestCases();
