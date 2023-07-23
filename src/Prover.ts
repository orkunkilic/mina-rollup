import { Rollup, RollupState } from "./Rollup.js"

const stepProof = async (stepInfo: any) => {
    const rollup = RollupState.createOneStep(
        stepInfo.initialCommitmentRoot,
        stepInfo.latestCommitmentRoot,
        stepInfo.initialNullifierRoot,
        stepInfo.latestNullifierRoot,
        stepInfo.inputUTXOs,
        stepInfo.outputUTXOs,
        stepInfo.signatures,
        stepInfo.inputWitnesses,
        stepInfo.initialNullifierWitnesses,
        stepInfo.latestNullifierWitnesses,
    );

    const proof = await Rollup.oneStep(
        rollup,
        stepInfo.initialCommitmentRoot,
        stepInfo.latestCommitmentRoot,
        stepInfo.initialNullifierRoot,
        stepInfo.latestNullifierRoot,
        stepInfo.inputUTXOs,
        stepInfo.outputUTXOs,
        stepInfo.signatures,
        stepInfo.inputWitnesses,
        stepInfo.initialNullifierWitnesses,
        stepInfo.latestNullifierWitnesses,
    );

    return proof;
}
/* 
const mergeProof = async (mergeInfo: any) => {
    const firstProof = mergeInfo.proofs[0];
    const secondProof = mergeInfo.proofs[1];

    const rollup = RollupState.createMerged(firstProof.publicInput, secondProof.publicInput);
    const mergedProof 
 */

const wakeUp = async () => {
    await Rollup.compile();
};

wakeUp();

process.on('message', async (message: any) => {
    if (message.type === 'step') {
        const proof = await stepProof(message);
        process.send ? ({ type: 'step', proof: proof.toJSON(), id: message.id }) : null;
    } else if (message.type === 'merge') {
        //
    }
})