/* eslint-disable @typescript-eslint/no-var-requires */
import fastify from 'fastify';
import fetch from 'node-fetch';
import Queue from 'queue';

import { putFile, getFile } from './filecoin.js';

import dotenv from 'dotenv';

const server = fastify();

import { spawn } from 'child_process';

// Start the server script in a separate process
const serverProcess = spawn('node', ['./build/src/prover_server.js']);

// Optional: Log output from the server script
serverProcess.stdout.on('data', (data: any) => {
  console.log(`Server: ${data}`);
});

serverProcess.stderr.on('data', (data: any) => {
  console.error(`Server Error: ${data}`);
});

serverProcess.on('close', (code: any) => {
  console.log(`Server process exited with code ${code}`);
});

server.get('/ping', async (request, reply) => {
  return 'pong\n';
});

// let utxo_tree = {};
// let nullifier_tree = {};

let global_mempool = new Queue({ results: [] });
let processingQueue = false;

interface Query {
  input_utxos: [string];
  output_utxos: [string];
  signatures: [string];
}

interface IReply {
  200: { success: boolean };
  302: { url: string };
  '4xx': { error: string };
}

server.post<{ Reply: IReply }>('/accept_tx', async (request: any, reply) => {
  global_mempool.push(request.body);
  if (global_mempool.length >= 2 && !processingQueue) {
    processingQueue = true;
    let dataToSend = [];
    for (let i = 0; i < 50; i++) {
      dataToSend.push(global_mempool.pop());
    }
    dataToSend.reverse();
    try {
      console.log('HERE### ALKSDFASD');
      const response = await fetch('http://127.0.0.1:3030/prover', {
        method: 'POST',
        body: JSON.stringify(dataToSend),
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json();
      console.log(json);
      global_mempool = new Queue({ results: [] }); // Clear the queue
    } catch (error) {
      console.log(error);
    } finally {
      processingQueue = false;
    }

    return reply.status(200).send({ success: true });
  }

  reply.status(200).send({ success: true });
});

server.listen({ port: 8080 }, (err, address) => {
  dotenv.config();

  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

export { global_mempool };
