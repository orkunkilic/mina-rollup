/* eslint-disable @typescript-eslint/no-var-requires */
import fastify from 'fastify'
import fetch from 'node-fetch'
import Queue from 'queue'

import { putFile, getFile } from './filecoin.js'

import dotenv from 'dotenv'

const server = fastify()

import { spawn } from 'child_process';
import { Field, PrivateKey, Signature } from 'snarkyjs';

// Start the server script in a separate process
// const serverProcess = spawn('node', ['./build/src/prover_server.js']);

// // Optional: Log output from the server script
// serverProcess.stdout.on('data', (data: any) => {
//     console.log(`Server: ${data}`);
// });

// serverProcess.stderr.on('data', (data: any) => {
//     console.error(`Server Error: ${data}`);
// });

// serverProcess.on('close', (code: any) => {
//     console.log(`Server process exited with code ${code}`);
// });


// server.get('/ping', async (request, reply) => {
//     return 'pong\n'
// })

// // let utxo_tree = {};
// // let nullifier_tree = {};

let global_mempool = new Queue({ results: [] })
// let processingQueue = false;

// interface Query {
//     input_utxos: [string],
//     output_utxos: [string],
//     signatures: [string],
// }

// interface IReply {
//     200: { success: boolean };
//     302: { url: string };
//     '4xx': { error: string };
// }


// server.post<{ Reply: IReply }>('/accept_tx', async (request: any, reply) => {
//     global_mempool.push(request.body);
//     // console.log(global_mempool.length, request.body);
//     console.log("ANAN");
//     if (global_mempool.length >= 2 && !processingQueue) {
//         processingQueue = true;
//         let dataToSend = [];
//         console.log("HERE");
//         for (let i = 0; i < 2; i++) {
//             dataToSend.push(global_mempool.pop());
//         }
//         console.log("HERE###");
//         dataToSend.reverse();
//         try {
//             console.log("HERE### ALKSDFASD");
//             const response = await fetch('http://127.0.0.1:3030/prover', {
//                 method: 'POST',
//                 body: JSON.stringify(dataToSend),
//                 headers: { 'Content-Type': 'application/json' },
//             });
//             console.log("HERE### ALKSDFASDliahsdifuhasd");
//             const json = await response.json();
//             console.log("HERE### ALKSDFASDliahsdifuhasd21342134");
//             console.log(json);
//             global_mempool = new Queue({ results: [] }); // Clear the queue
//         } catch (error) {
//             console.log(error);
//         } finally {
//             console.log("nbcxzvmbvmzx")
//             processingQueue = false;
//         }

//         return reply.status(302).send({ url: "/prover" });
//     }

//     reply.status(200).send({ success: true })
// })

server.listen({ port: 8080 }, (err, address) => {
    // const pk = PrivateKey.random();
    // console.log(Signature.create(pk, [Field(1)]).toBase58());

    dotenv.config()

    // const hmm = putFile("hello world 31");
    // console.log(hmm)
    
    // const hmm2 = getFile("bafybeiezl52eo4yqnq6zhz6bknc5re3kto5fghcwjskrorhijakq4fx5ju")
    // console.log(hmm2)

    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})

export { global_mempool };