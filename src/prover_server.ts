import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { MerkleMap, PrivateKey, PublicKey, Scalar, Signature } from 'snarkyjs';
import { Transaction, UTXO, compile, createStepInfos, generateProofsParellel } from './Rollup.js';

const server = fastify();

interface IPostBody {
    input_utxos: object[],
    output_utxos: object[],
    signatures: object[],
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


server.post('/prover', async (request: FastifyRequest<{ Body: IPostBody[] }>, reply: FastifyReply) => {
    const transactions = request.body;
    console.log('TXS', transactions, typeof transactions)
    // hashData(body);
    // console.log(reqBody);
    // const transactions = JSON.parse(transactions);
    // iterate over each transaction, convert them to snarkyjs -> Transaction[]
    const convertedTransaction: Transaction[] = transactions.map((tx: any) => {
        const input_utxos: UTXO[] = tx.input_utxos.map((utxo: any) => UTXO.create(PublicKey.fromBase58(utxo.publicKey), utxo.amount, utxo.salt));
        console.log("!!!!!!!!!!!", input_utxos)
        const output_utxos: UTXO[] = tx.output_utxos.map((utxo: any) => UTXO.create(PublicKey.fromBase58(utxo.publicKey), utxo.amount, utxo.salt));
        console.log("+++++++++++", output_utxos)
        const signatures: Signature[] = tx.signatures.map((sig: string) => Signature.fromBase58(sig));
        // const signatures = tx.signatures.map((sig: any) => Signature.create(new PrivateKey(Scalar.from(2)), sig.message));
        console.log("***********", signatures)
        return { inputUTXOs: input_utxos, outputUTXOs: output_utxos, signatures };
    });

    let theBigObjects = createStepInfos(new MerkleMap(), new MerkleMap(), convertedTransaction);
    generateProofsParellel(theBigObjects);

    // createStepInfos() ->
    // generateProofsParallel() ->
    // mergeProofs() ->
    return reply.code(200).send({ success: true });
});

server.listen({ port: 3030 }, (err, address) => {
    compile()
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
});
