import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import {
  Field,
  MerkleMap,
  PrivateKey,
  PublicKey,
  Scalar,
  Signature,
} from 'snarkyjs';
import {
  Transaction,
  UTXO,
  callContract,
  compile,
  createStepInfos,
  generateProofsParellel,
  mergeProofs,
} from './Rollup.js';
import queue, { FastifyQueueOptions } from 'fastify-queue';
import IORedis from 'ioredis';
import { Queue, RedisConnection, Worker } from 'bullmq';

declare module 'fastify' {
  interface FastifyInstance {
    proofQueue: Queue;
  }
}

const server = fastify();

const connection = new IORedis({
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const proofQueue = new Queue('proof', { connection: connection });
server.decorate('proofQueue', proofQueue);

const worker = new Worker('proof', async job => {
  const transactions = job.data.transactions;

  // json to snarkyjs types
  const convertedTransaction: Transaction[] = transactions.map((tx: any) => {
    const input_utxos: UTXO[] = tx.input_utxos.map((utxo: any) =>
      UTXO.create(
        PublicKey.fromBase58(utxo.public_key),
        Field(utxo.amount),
        Field(utxo.salt)
      )
    );

    const output_utxos: UTXO[] = tx.output_utxos.map((utxo: any) =>
      UTXO.create(
        PublicKey.fromBase58(utxo.public_key),
        Field(utxo.amount),
        Field(utxo.salt)
      )
    );

    const signatures: Signature[] = tx.signatures.map((sig: string) =>
      Signature.fromBase58(sig)
    );

    return { inputUTXOs: input_utxos, outputUTXOs: output_utxos, signatures };
  });

  // TODO: remove this
  const utxo = UTXO.create(
    PublicKey.fromBase58(
      'B62qmKjaQZTZa2yyDPt3tizyMRx4TySoNPagK1qcCQCMAWpHLi2TXrF'
    ),
    Field(1),
    Field(1)
  );
  const map = new MerkleMap();
  map.set(utxo.hash(), utxo.hash());

  const stepInfos = createStepInfos(
    map,
    new MerkleMap(),
    convertedTransaction
  );

  console.log("Proofs generating...");
  const proofs = await generateProofsParellel(stepInfos);
  console.log("Proofs generated!");

  console.log("Proofs merging...");
  const proof = await mergeProofs(proofs);
  console.log("Proofs merged!");

  const res = await callContract(proof);
  console.log(res);

  // TODO: send data to ipfs
  // TODO: send proof to smart contract

}, { connection: connection });

worker.on('completed', job => {
  console.log(`${job.id} has completed, tx hash: $TODO`);
});

worker.on('failed', (job: any, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

interface IPostBody {
  input_utxos: object[];
  output_utxos: object[];
  signatures: object[];
}

server.post(
  '/prover',
  async (
    request: FastifyRequest<{ Body: IPostBody[] }>,
    reply: FastifyReply
  ) => {
    const transactions = request.body;

    const job = await server.proofQueue.add('proof', { transactions });
    
    return reply.code(200).send({ success: true, job_id: job.id });
  }
);

server.listen({ port: 3030 }, async (err, address) => {
  await compile();
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
