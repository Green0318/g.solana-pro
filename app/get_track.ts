#!/usr/bin/env ts-node
import yargs = require("yargs/yargs");
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { TrackUpload } from "../target/types/track_upload";
import fs from "fs";
import { IPFS, create } from "ipfs-core";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";

const argv = yargs(process.argv.slice(2))
  .describe({ key: "Get the track from Solana and download it." })
  .options({
    key: { type: "string", demandOption: true, alias: "k" },
    download: { type: "boolean", default: true, alias: "d" },
  }).argv;

const main = async () => {
  const args = await argv;
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.TrackUpload as Program<TrackUpload>;
  const key = new anchor.web3.PublicKey(args.key);
  let trackState = await program.account.track.fetch(key);
  console.log(
    `TRACK: ${trackState.artist}, ${trackState.cid}, ${trackState.trackTitle}`
  );
  if (args.download) {
    const node = await create();
    const cid = String(trackState.cid);
    console.log(`CID: ${cid}`);
    for await (const file of node.ls(cid)) {
      console.log(file.path);
      const chunks = [];
      for await (const chunk of node.files.read(file.cid)) {
        chunks.push(chunk);
      }
      fs.writeFileSync(file.name, uint8ArrayConcat(chunks).toString());
    }
    node.stop();
  }
};

main().then(() => {
  console.log("Downloaded track successfully.");
});
