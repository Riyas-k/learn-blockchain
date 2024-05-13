import express from 'express'
import crypto from 'crypto-js';
import Web3 from 'web3';

const web3 =  new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const app = express();

app.use(express.json());




class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }
    calculateHash() {
        return crypto.SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, "01/01/2020", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

let blockchain = new Blockchain();

app.post('/addData',(req,res)=>{
    let data = req.body;
    let newBlock = new Block(blockchain.getLatestBlock().index + 1, new Date(), data);
    blockchain.addBlock(newBlock);
    res.status(200).send("Data added successfully");
});

app.get('/getChain', (req, res) => {
    res.status(200).send(blockchain.chain);
});


const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`Server started ${PORT}`);
})