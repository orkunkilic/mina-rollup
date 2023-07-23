import { writeFile } from 'node:fs';

// create sk and pk

import { Field, MerkleMap, PrivateKey, PublicKey, Signature } from "snarkyjs";
import { UTXO } from "./Rollup.js";

// create utxo pk amount=1 salt=i
// insert utxo into map ->> map.set(utxo.hash(), utxo.hash())
// sign utxo -> signature.create(sk, [utxo.hash()])
// utxo json -> {public_key: pk, amount: 1, salt: i}
// output_utxo json -> {public_key: pk, amount: 1, salt: i+2000}
// signature.toBase58()

// dump sk and pk, array of utxos, array of signatures
// dump nullifier.getRoot() (empty) and commitment.getRoot() // two map we created

// new script.js -> iterate over utxos and signatures -> create a transaction
// transaction: {input_utxos: [utxo], output_utxos: [output], signatures: [signature]}

const main = () => {
    let commitmentMap = new MerkleMap();
    let nullifierMap = new MerkleMap();

    let priv_key = PrivateKey.random();
    let pub_key = priv_key.toPublicKey().toBase58();

    let data: any = {};

    data.public_key = pub_key;
    data.private_key = priv_key;
    data.transactions = [];
    data.utxo_hashes = [];

    for(let i = 1;500 >= i;i++) {
        let utxo = UTXO.create(PublicKey.fromBase58(pub_key), Field(1), Field(i));
        let input_utxo = {public_key: pub_key, amount: 1, salt: i};
        let output_utxo = {public_key: pub_key, amount: 1, salt: i + 1000};

        let signature = Signature.create(priv_key, [utxo.hash()]).toBase58();        
        let transaction = {input_utxos: [input_utxo], output_utxos: [output_utxo], signatures: [signature]};

        data.transactions.push(transaction);

        data.utxo_hashes.push(utxo.hash());
        commitmentMap.set(utxo.hash(), utxo.hash());
    }


    data.commitment_root = commitmentMap.getRoot();
    data.nullifier_root = nullifierMap.getRoot();

    // dump data to file
    writeFile('data.json', JSON.stringify(data), (err) => {
        if(err) {
            console.log(err);
        }
    });
}

main();