#!/usr/bin/env ts-node
import yargs = require("yargs/yargs");
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { TrackUpload } from "../target/types/track_upload";
import fs from "fs";
import { IPFS, create } from "ipfs-core";
import type { CID } from "ipfs-core";
import { string } from "yargs";
import { isIPFS } from "ipfs-core";

const argv = yargs(process.argv.slice(2))
  .describe({ key: "Update solana track entry." })
  .options({
    key: { type: "string", demandOption: true, alias: "k" },
    cid: { type: "string", default: null, alias: "c" },
    path: { type: "string", default: null, alias: "p" },
    artist: { type: "string", default: "", alias: "a" },
    title: { type: "string", default: "", alias: "t" },
  }).argv;

const main = async () => {
  const args = await argv;

  if (args.cid && !isIPFS.cid(args.cid)) {
    console.error(`CID ${args.cid} is invalid`);
    process.exit(1);
  }
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.TrackUpload as Program<TrackUpload>;
  const signer = program.provider.wallet;
  const key = new anchor.web3.PublicKey(args.key);
  let cid = args.cid ? args.cid : "";
  if (args.path) {
    const node = await create();
    const file = fs.readFileSync(args.path);
    const file_upload = await node.add(
      {
        path: args.path,
        content: file.buffer,
      },
      { wrapWithDirectory: true }
    );
    cid = file_upload.cid.toString();
    await node.stop();
  }

  let trackState = await program.account.track.fetch(key);
  if (trackState.signer.toString() != signer.publicKey.toString()) {
    console.error("Only the original creator of the track can update it.");
    console.error(
      `TRACK signer ${trackState.signer}, Signer: ${signer.publicKey}`
    );
    process.exit(1);
  }
  const tx = await program.rpc.update(cid, args.artist, args.title, {
    accounts: {
      signer: signer.publicKey,
      track: key,
    },
    signers: [],
  });
  console.log("Your transaction signature", tx);
  console.log("Track key", key.toString());
  let trackUpdated = await program.account.track.fetch(key);
  console.log(
    `Track artist: ${trackUpdated.artist}, cid: ${trackUpdated.cid}, title: ${trackUpdated.trackTitle} `
  );
};

main().then(() => {
  console.log("Uploaded track successfully.");
});
