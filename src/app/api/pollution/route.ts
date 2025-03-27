import { spawn } from 'child_process';

export async function GET() {
    try {
        const pythonProcess = spawn('python', ['python/fetch_pollution.py'], {
            env: { ...process.env }, // Pass environment variables
        });

        let data = '';
        for await (const chunk of pythonProcess.stdout) {
            data += chunk;
        }

        let error = '';
        for await (const chunk of pythonProcess.stderr) {
            error += chunk;
        }

        const exitCode = await new Promise((resolve) => {
            pythonProcess.on('close', resolve);
        });

        if (exitCode !== 0) {
            throw new Error(`Python script failed: ${error}`);
        }

        const measurements = JSON.parse(data);
        return new Response(JSON.stringify(measurements), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}