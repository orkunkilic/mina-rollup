import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { Signature } from 'snarkyjs';
import { UTXO } from './Rollup';

const server = fastify();

interface IPostBody {
    data: Array<{ [key: string]: any }>;
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


server.post('/prover', async (request: FastifyRequest<{ Body: IPostBody }>, reply: FastifyReply) => {
    const body = request.body;
    hashData(body);
    // iterate over each transaction, convert them to snarkyjs -> Transaction[]
    // createStepInfos() ->
    // generateProofsParallel() ->
    // mergeProofs() ->
    return reply.code(200).send({ success: true });
});

server.listen({ port: 3030 }, (err, address) => {
    // compile
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
});
