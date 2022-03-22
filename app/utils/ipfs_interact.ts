import fs, { PathOrFileDescriptor } from "fs";

import type { CID } from "ipfs-core";
import { isIPFS, create as node_create } from "ipfs-core";
import { create, globSource } from "ipfs-http-client"
import { concat as uint8ArrayConcat } from "uint8arrays/concat";

const infura_url = {url:"https://ipfs.infura.io:5001"};
const infura_browse = "https://ipfs.infura.io/ipfs/";

export const upload_file = async(path: PathOrFileDescriptor) => {
    let cid = "";
    const node = create(infura_url);
    const file = fs.readFileSync(path);
    for await (const f of node.addAll(
      [{path: path, content: file}],
      { wrapWithDirectory: true }
    )){
      console.log(`${f.path? f.path: "dir"}: ${infura_browse}/${f.cid}, `);
      // Last CID is the one to the directory
      cid = f.cid.toString();
    }
    return cid
}

export const get_file = async(track_cid: String) => {
    const node = await node_create();
    const cids = [];
    // load directory and write out each track
    for await (const file of node.ls(String(track_cid))) {
      console.log(`$cid: ${file.cid}, name: ${file.name}, path: ${file.path}, fild cid: ${file.cid}, ${file.type}`)
      const chunks = [];
      for await (const chunk of node.cat(file.cid)) {
        chunks.push(chunk)
      }
      fs.writeFileSync(file.name, uint8ArrayConcat(chunks))
      cids.push({path:file.path, cid: file.cid})
    }
    node.stop()
    return cids
}

