import { readFileSync, writeFile } from 'node:fs';

// create sk and pk

import { Field, MerkleMap, PrivateKey, Signature } from "snarkyjs";
import { UTXO } from "./Rollup.js";
import fetch from 'node-fetch';

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

const main = async () => {
    
    let data: any = {};

    try {
        const data_string = readFileSync('data.json', 'utf8');
        console.log("Read data successfully");

        // Convert data to JSON to dictionary
        data = JSON.parse(data_string);
    
    } catch (err) {
        console.error(err);
    }

    // iterate both arrays and create transactions
    for(let i = 0; i < data.transactions.length; i++) {
        // send transaction to server
        // console.log(data.transactions[i]);
        const response = await fetch('http://127.0.0.1:8080/accept_tx', {
            method: 'POST',
            body: JSON.stringify(data.transactions[i]),
            headers: { 'Content-Type': 'application/json' },
        });
        const json = await response.json();
        console.log(i, json);
    }

}

main();