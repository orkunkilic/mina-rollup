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
  compile,
  createStepInfos,
  generateProofsParellel,
  mergeProofs,
} from './Rollup.js';

const server = fastify();

interface IPostBody {
  input_utxos: object[];
  output_utxos: object[];
  signatures: object[];
}

function toHex(str: string) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
}

async function hashData(data: any) {
  let hash = '';
  for (let i = 0; i < data.length; i++) {
    hash = hash + data[i].toString();
  }
  console.log(toHex(hash));
}

server.post(
  '/prover',
  async (
    request: FastifyRequest<{ Body: IPostBody[] }>,
    reply: FastifyReply
  ) => {
    const transactions = request.body;

    // INSTEAD: Push transactions to queue as job
    // From here: Move to worker
    const convertedTransaction: Transaction[] = transactions.map((tx: any) => {
      const input_utxos: UTXO[] = tx.input_utxos.map((utxo: any) =>
        UTXO.create(
          PublicKey.fromBase58(utxo.public_key),
          Field(utxo.amount),
          Field(utxo.salt)
        )
      );
      console.log('!!!!!!!!!!!', input_utxos);
      const output_utxos: UTXO[] = tx.output_utxos.map((utxo: any) =>
        UTXO.create(
          PublicKey.fromBase58(utxo.public_key),
          Field(utxo.amount),
          Field(utxo.salt)
        )
      );
      console.log('+++++++++++', output_utxos);
      const signatures: Signature[] = tx.signatures.map((sig: string) =>
        Signature.fromBase58(sig)
      );
      // const signatures = tx.signatures.map((sig: any) => Signature.create(new PrivateKey(Scalar.from(2)), sig.message));
      console.log('***********', signatures);
      return { inputUTXOs: input_utxos, outputUTXOs: output_utxos, signatures };
    });

    const utxo = UTXO.create(
      PublicKey.fromBase58(
        'B62qmKjaQZTZa2yyDPt3tizyMRx4TySoNPagK1qcCQCMAWpHLi2TXrF'
      ),
      Field(1),
      Field(1)
    );
    const map = new MerkleMap();
    map.set(utxo.hash(), utxo.hash());

    let theBigObjects = createStepInfos(
      map,
      new MerkleMap(),
      convertedTransaction
    );
    const proofs = await generateProofsParellel(theBigObjects);

    const proof = await mergeProofs(proofs);

    // Until here: Move to worker
    return reply.code(200).send({ success: true, proof: proof.toJSON() });
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
