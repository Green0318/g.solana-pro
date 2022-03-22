#!/usr/bin/env ts-node
import yargs = require("yargs/yargs");
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { TrackUpload } from "../target/types/track_upload";
import fs from "fs";
import { get_file, get_infura_url } from "./utils/ipfs_interact";

const argv = yargs(process.argv.slice(2)).describe({
  key: "Get the track from Solana and download it.",
}).argv;

const main = async () => {
  const args = await argv;
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.TrackUpload as Program<TrackUpload>;
  const signer = program.provider.wallet;
  const my_tracks = await program.account.track.all([
    { memcmp: { offset: 8, bytes: signer.publicKey.toBase58() } },
  ]);
  for (const track of my_tracks) {
    console.log(
      `Artist: ${track.account.artist}, Title: ${track.account.trackTitle}, cid: ${track.account.cid}`
    );
    console.log(await get_infura_url(`${track.account.cid}`));
  }
};

main().then(() => {
  console.log("Got your tracks.");
});
