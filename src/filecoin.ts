import { Web3Storage, File } from 'web3.storage';
import { Buffer } from 'buffer';

export async function putFile(data: any) {
  const token = process.env.FILE_API_TOKEN ?? '';
  console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa', token);
  const storage = new Web3Storage({ token: token });

  // Creating Buffer from data and wrap it as a File
  const file = new File([Buffer.from(JSON.stringify(data))], 'data.json', {
    type: 'application/json',
  });

  const cid = await storage.put([file]);

  console.log(`IPFS CID: ${cid}`);
  console.log(`Gateway URL: https://dweb.link/ipfs/${cid}`);
}

export async function getFile(cid: string) {
  const token = process.env.FILE_API_TOKEN ?? '';
  const storage = new Web3Storage({ token: token });
  const res = await storage.get(cid);

  if (res && res.ok) {
    const files: any = await res.files();
    console.log(files);
  }

  return res?.files() ?? null;
}
