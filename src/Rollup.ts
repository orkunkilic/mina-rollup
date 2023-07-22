import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  SelfProof,
  Experimental,
  Struct,
  Bool,
  Circuit,
  Poseidon,
  MerkleMap,
  MerkleTree,
  MerkleWitness,
  MerkleMapWitness,
  verify,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Proof,
  Permissions,
  Empty,
  PublicKey,
  Signature,
  Provable,
} from 'snarkyjs';
import child_proc from 'child_process';

class MerkleWitness20 extends MerkleWitness(20) {}

const K = 1;

// create 30 prover.js fork
const proverForks = Array.from({ length: 30 }, () =>
  child_proc.fork('./src/prover.js')
);

const lastMessages: any = {};

// set up message handler for each fork
proverForks.forEach((fork, i) => {
  fork.on('message', async (message: any) => {
    if (message.type === 'step') {
      lastMessages[i] = {
        id: message.id,
        proof: Proof.fromJSON(message.proof),
      };
    }
  });
});

class UTXO extends Struct({
  publicKey: PublicKey,
  amount: Field,
  salt: Field,
}) {
  static create(publicKey: PublicKey, amount: Field, salt: Field) {
    return new UTXO({
      publicKey,
      amount,
      salt,
    });
  }

  hash() {
    return Poseidon.hash([
      Poseidon.hash(this.publicKey.toFields()),
      this.amount,
      this.salt,
    ]);
  }

  checkSignature(signature: Signature) {
    const hash = this.hash();
    return signature.verify(this.publicKey, [hash]);
  }
}

export class RollupState extends Struct({
  initialCommitmentRoot: Field,
  latestCommitmentRoot: Field,
  initialNullifierRoot: Field,
  latestNullifierRoot: Field,
}) {
  static createOneStep(
    initialCommitmentRoot: Field,
    latestCommitmentRoot: Field,
    initialNullifierRoot: Field,
    latestNullifierRoot: Field,
    inputUTXOs: UTXO[],
    outputUTXOs: UTXO[],
    signatures: Signature[],
    inputWitnesses: MerkleMapWitness[],
    initialNullifierWitnesses: MerkleMapWitness[],
    latestNullifierWitnesses: MerkleMapWitness[]
  ) {
    // const [ witnessRootBefore, witnessKey ] = commitmentWitness.computeRootAndKey(currentValue);
    // initialRoot.assertEquals(witnessRootBefore);
    // witnessKey.assertEquals(key);
    // const [ witnessRootAfter, _ ] = commitmentWitness.computeRootAndKey(currentValue.add(incrementAmount));
    // latestRoot.assertEquals(witnessRootAfter);

    for (let i = 0; i < inputUTXOs.length; i++) {
      const inputUTXO = inputUTXOs[i];
      const inputWitness = inputWitnesses[i];
      const signature = signatures[i];
      const nullifierWitness = initialNullifierWitnesses[i];
      const latestNullifierWitness = latestNullifierWitnesses[i];

      inputUTXO.checkSignature(signature).assertTrue();

      const [witnessRootBefore, witnessKey] = inputWitness.computeRootAndKey(
        inputUTXO.hash()
      );
      initialCommitmentRoot.assertEquals(witnessRootBefore);
      witnessKey.assertEquals(inputUTXO.hash());

      // check nullifier is unused in initial state
      const [nullifierWitnessRootBefore, nullifierWitnessKey] =
        nullifierWitness.computeRootAndKey(inputUTXO.hash());
      initialNullifierRoot.assertNotEquals(nullifierWitnessRootBefore); // FIXME: find a fix
      nullifierWitnessKey.assertEquals(inputUTXO.hash());

      // check nullifier is used in final state
      const [latestNullifierWitnessRootBefore, latestNullifierWitnessKey] =
        latestNullifierWitness.computeRootAndKey(inputUTXO.hash());
      latestNullifierRoot.assertEquals(latestNullifierWitnessRootBefore);
      latestNullifierWitnessKey.assertEquals(inputUTXO.hash());
    }

    // check that all output UTXOs are unique
    const totalIn: Field = inputUTXOs.reduce(
      (acc, utxo) => acc.add(utxo.amount),
      Field(0)
    );
    const totalOut: Field = outputUTXOs.reduce(
      (acc, utxo) => acc.add(utxo.amount),
      Field(0)
    );
    totalIn.assertEquals(totalOut);

    return new RollupState({
      initialCommitmentRoot,
      latestCommitmentRoot,
      initialNullifierRoot,
      latestNullifierRoot,
    });
  }

  static createMerged(state1: RollupState, state2: RollupState) {
    return new RollupState({
      initialCommitmentRoot: state1.initialCommitmentRoot,
      latestCommitmentRoot: state2.latestCommitmentRoot,
      initialNullifierRoot: state1.initialNullifierRoot,
      latestNullifierRoot: state2.latestNullifierRoot,
    });
  }

  static assertEquals(state1: RollupState, state2: RollupState) {
    state1.initialCommitmentRoot.assertEquals(state2.initialCommitmentRoot);
    state1.latestCommitmentRoot.assertEquals(state2.latestCommitmentRoot);
    state1.initialNullifierRoot.assertEquals(state2.initialNullifierRoot);
    state1.latestNullifierRoot.assertEquals(state2.latestNullifierRoot);
  }
}

// ===============================================================

export const Rollup = Experimental.ZkProgram({
  publicInput: RollupState,
  publicOutput: Empty,

  methods: {
    oneStep: {
      privateInputs: [
        Field,
        Field,
        Field,
        Field,
        Provable.Array(UTXO, 1),
        Provable.Array(UTXO, 1),
        Provable.Array(Signature, 1),
        Provable.Array(MerkleMapWitness, 1),
        Provable.Array(MerkleMapWitness, 1),
        Provable.Array(MerkleMapWitness, 1),
      ],

      method(
        state: RollupState,
        initialCommitmentRoot: Field,
        latestCommitmentRoot: Field,
        initialNullifierRoot: Field,
        latestNullifierRoot: Field,
        inputUTXOs: UTXO[],
        outputUTXOs: UTXO[],
        signatures: Signature[],
        inputWitnesses: MerkleMapWitness[],
        initialNullifierWitnesses: MerkleMapWitness[],
        latestNullifierWitnesses: MerkleMapWitness[]
      ) {
        const computedState = RollupState.createOneStep(
          initialCommitmentRoot,
          latestCommitmentRoot,
          initialNullifierRoot,
          latestNullifierRoot,
          inputUTXOs,
          outputUTXOs,
          signatures,
          inputWitnesses,
          initialNullifierWitnesses,
          latestNullifierWitnesses
        );
        RollupState.assertEquals(computedState, state);

        return undefined;
      },
    },

    merge: {
      privateInputs: [SelfProof, SelfProof],

      method(
        newState: RollupState,
        rollup1proof: SelfProof<RollupState, Empty>,
        rollup2proof: SelfProof<RollupState, Empty>
      ) {
        rollup1proof.verify();
        rollup2proof.verify();

        rollup2proof.publicInput.initialCommitmentRoot.assertEquals(
          rollup1proof.publicInput.latestCommitmentRoot
        );
        rollup1proof.publicInput.initialCommitmentRoot.assertEquals(
          newState.initialCommitmentRoot
        );
        rollup2proof.publicInput.latestCommitmentRoot.assertEquals(
          newState.latestCommitmentRoot
        );

        rollup2proof.publicInput.initialNullifierRoot.assertEquals(
          rollup1proof.publicInput.latestNullifierRoot
        );
        rollup1proof.publicInput.initialNullifierRoot.assertEquals(
          newState.initialNullifierRoot
        );
        rollup2proof.publicInput.latestNullifierRoot.assertEquals(
          newState.latestNullifierRoot
        );

        return undefined;
      },
    },
  },
});

export let RollupProof_ = Experimental.ZkProgram.Proof(Rollup);
export class RollupProof extends RollupProof_ {}

// ===============================================================

export class RollupContract extends SmartContract {
  @state(Field) commitmentRoot = State<Field>();
  @state(Field) nullifierRoot = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    // this.setPermissions({
    //   ...Permissions.default(),
    //   editState: Permissions.proofOrSignature(),
    // });
  }

  @method initStateRoot(commitmentRoot: Field, nullifierRoot: Field) {
    this.commitmentRoot.set(commitmentRoot);
    this.nullifierRoot.set(nullifierRoot);
  }

  @method update(rollupStateProof: RollupProof) {
    // const currentState = this.state.get();
    // this.state.assertEquals(currentState);

    // rollupStateProof.publicInput.initialRoot.assertEquals(currentState);

    // rollupStateProof.verify();

    // this.state.set(rollupStateProof.publicInput.latestRoot);

    const commitmentRoot = this.commitmentRoot.getAndAssertEquals();
    const nullifierRoot = this.nullifierRoot.getAndAssertEquals();

    rollupStateProof.publicInput.initialCommitmentRoot.assertEquals(
      commitmentRoot
    );
    rollupStateProof.publicInput.initialNullifierRoot.assertEquals(
      nullifierRoot
    );

    rollupStateProof.verify();

    this.commitmentRoot.set(rollupStateProof.publicInput.latestCommitmentRoot);
    this.nullifierRoot.set(rollupStateProof.publicInput.latestNullifierRoot);
  }
}

interface Transaction {
  inputUTXOs: UTXO[];
  outputUTXOs: UTXO[];
  signatures: Signature[];
}

export const compile = async () => {
  const { verificationKey } = await Rollup.compile();

  return verificationKey;
};

export const createStepInfos = (
  commitmentMap: MerkleMap,
  nullifierMap: MerkleMap,
  transactions: Transaction[]
) => {
  return transactions.map(({ inputUTXOs, outputUTXOs, signatures }) => {
    const inputWitnesses = inputUTXOs.map((utxo) =>
      commitmentMap.getWitness(utxo.hash())
    );
    const initialNullifierWitnesses = inputUTXOs.map((utxo) =>
      nullifierMap.getWitness(utxo.hash())
    );

    const initialCommitmentRoot = commitmentMap.getRoot();
    const initialNullifierRoot = nullifierMap.getRoot();

    for (let inputUTXO of inputUTXOs) {
      nullifierMap.set(inputUTXO.hash(), inputUTXO.hash());
    }
    const latestNullifierWitnesses = inputUTXOs.map((utxo) =>
      nullifierMap.getWitness(utxo.hash())
    );

    for (let outputUTXO of outputUTXOs) {
      commitmentMap.set(outputUTXO.hash(), outputUTXO.hash());
    }

    return {
      initialCommitmentRoot,
      latestCommitmentRoot: commitmentMap.getRoot(),
      initialNullifierRoot,
      latestNullifierRoot: nullifierMap.getRoot(),
      inputUTXOs,
      outputUTXOs,
      signatures,
      inputWitnesses,
      initialNullifierWitnesses,
      latestNullifierWitnesses,
    };
  });
};

export const generateProofsParellel = async (stepInfos: any[]) => {
  const id = Math.random().toString();
  proverForks.forEach((fork, i) => {
    fork.send({ type: 'step', stepInfo: stepInfos[i], id });
  });

  // wait for all prover forks to finish
  while (true) {
    // check if all objects in lastMessages have the same id
    const allSame = Object.values(lastMessages).every(
      (message: any) => message.id === id
    );
    if (allSame) {
      break;
    } else {
      // sleep a sec
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

async function main() {
  console.log('compiling...');

  const { verificationKey } = await Rollup.compile();

  console.log('generating transition information');

  let commitmentMap = new MerkleMap();
  let nullifierMap = new MerkleMap();

  // generate 10 private keys
  const privateKeys = Array.from({ length: 10 }, () => PrivateKey.random());

  // insert 10 UTXOs into the commitment map
  const commitmentUTXOs = privateKeys.map((privateKey, i) => {
    const publicKey = privateKey.toPublicKey();
    const amount = Field(100);
    const salt = Field(i);
    const utxo = UTXO.create(publicKey, amount, salt);
    commitmentMap.set(utxo.hash(), utxo.hash());
    return utxo;
  });

  const rollupStepInfo: any[] = [];

  // transitions.forEach(({ key, increment }) => {
  //   const witness = map.getWitness(key);
  //   const initialRoot = map.getRoot();

  //   const currentValue = map.get(key);
  //   const updatedValue = map.get(key).add(increment);

  //   map.set(key, updatedValue);
  //   const latestRoot = map.getRoot();

  //   rollupStepInfo.push({ initialRoot, latestRoot, key, currentValue, increment, witness });
  // });

  commitmentUTXOs.forEach((utxo, i) => {
    const witness = commitmentMap.getWitness(utxo.hash());
    const initialCommitmentRoot = commitmentMap.getRoot();
    const initialNullifierRoot = nullifierMap.getRoot();

    const inputUTXOs = [utxo];

    // output utxo is same but with different salt
    const outputUTXOs = [
      UTXO.create(utxo.publicKey, utxo.amount, utxo.salt.add(Field(1))),
    ];

    const signatures = [Signature.create(privateKeys[i], [utxo.hash()])];

    const inputWitnesses = [witness];
    const initialNullifierWitnesses = [nullifierMap.getWitness(utxo.hash())];

    // insert nullifier into nullifier map
    nullifierMap.set(utxo.hash(), utxo.hash());

    const latestNullifierWitnesses = [nullifierMap.getWitness(utxo.hash())];

    const latestCommitmentRoot = commitmentMap.getRoot();
    const latestNullifierRoot = nullifierMap.getRoot();

    rollupStepInfo.push({
      initialCommitmentRoot,
      latestCommitmentRoot,
      initialNullifierRoot,
      latestNullifierRoot,
      inputUTXOs,
      outputUTXOs,
      signatures,
      inputWitnesses,
      initialNullifierWitnesses,
      latestNullifierWitnesses,
    });
  });

  console.log('making first set of proofs');

  // These could all be done in parallel in a real rollup
  // If T is the time to make a proof this could take time T
  // const rollupProofs = rollupStepInfo.map(async ({ initialRoot, latestRoot, key, currentValue, increment, witness }) => {
  //   const rollup = RollupState.createOneStep(initialRoot, latestRoot, key, currentValue, increment, witness);
  //   const proof = await Rollup.oneStep(rollup, initialRoot, latestRoot, key, currentValue, increment, witness);
  //   return proof;
  // });
  const rollupProofs: Proof<RollupState, Empty>[] = [];

  for (let i = 0; i < rollupStepInfo.length; i++) {
    const {
      initialCommitmentRoot,
      latestCommitmentRoot,
      initialNullifierRoot,
      latestNullifierRoot,
      inputUTXOs,
      outputUTXOs,
      signatures,
      inputWitnesses,
      initialNullifierWitnesses,
      latestNullifierWitnesses,
    } = rollupStepInfo[i];
    const rollup = RollupState.createOneStep(
      initialCommitmentRoot,
      latestCommitmentRoot,
      initialNullifierRoot,
      latestNullifierRoot,
      inputUTXOs,
      outputUTXOs,
      signatures,
      inputWitnesses,
      initialNullifierWitnesses,
      latestNullifierWitnesses
    );
    const proof = await Rollup.oneStep(
      rollup,
      initialCommitmentRoot,
      latestCommitmentRoot,
      initialNullifierRoot,
      latestNullifierRoot,
      inputUTXOs,
      outputUTXOs,
      signatures,
      inputWitnesses,
      initialNullifierWitnesses,
      latestNullifierWitnesses
    );
    rollupProofs.push(proof);
  }

  console.log('merging proofs');

  // These could also all be done in parallel in a real rollup
  // If T is the time to make a proof this could take time log(n)*T
  // const proof = await rollupProofs.reduce(async (a, b) => {
  //   const rollup = RollupState.createMerged((await a).publicInput, (await b).publicInput);
  //   return await Rollup.merge(rollup, (await a), (await b));
  // });
  let proof: Proof<RollupState, Empty> = rollupProofs[0];
  for (let i = 1; i < rollupProofs.length; i++) {
    const rollup = RollupState.createMerged(
      proof.publicInput,
      rollupProofs[i].publicInput
    );
    let mergedProof = await Rollup.merge(rollup, proof, rollupProofs[i]);
    proof = mergedProof;
  }

  console.log('verifying rollup');
  console.log(proof.publicInput.latestCommitmentRoot.toString());
  console.log(proof.publicInput.latestNullifierRoot.toString());

  const ok = await verify(proof.toJSON(), verificationKey);
  console.log('ok', ok);
}

main();
