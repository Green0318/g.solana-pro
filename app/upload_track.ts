#!/usr/bin/env ts-node
import yargs = require("yargs/yargs");
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { TrackUpload } from "../target/types/track_upload";
import fs from "fs";
import { IPFS, create, isIPFS } from "ipfs-core";
import type { CID } from "ipfs-core";

const argv = yargs(process.argv.slice(2)).options({
  cid: { type: "string", default: null, alias: "c" },
  path: { type: "string", default: null, alias: "p" },
  artist: { type: "string", default: "", alias: "a" },
  title: { type: "string", default: "", alias: "t" },
}).argv;

const main = async () => {
  const args = await argv;
  if (!args.cid && !args.path) {
    console.error("Either path or cid need to be provided");
    process.exit(1);
  }

  if (args.cid && !isIPFS.cid(args.cid)) {
    console.error(`CID ${args.cid} is invalid`);
    process.exit(1);
  }
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.TrackUpload as Program<TrackUpload>;
  const signer = program.provider.wallet;
  const track = anchor.web3.Keypair.generate();
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
  //
  const tx = await program.rpc.initialize(cid, args.artist, args.title, {
    accounts: {
      signer: signer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      track: track.publicKey,
    },
    signers: [track],
  });
  console.log("Your transaction signature", tx);
  console.log("Track key", track.publicKey.toString());
  let trackState = await program.account.track.fetch(track.publicKey);
  console.log(
    `TRACK: ${trackState.artist}, ${trackState.cid}, ${trackState.trackTitle} `
  );
};

main().then(() => {
  console.log("Uploaded track successfully.");
});
