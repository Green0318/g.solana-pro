import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { TrackUpload } from "../target/types/track_upload";
import fs from 'fs';
import { IPFS, create } from 'ipfs-core';
import type { CID } from 'ipfs-core';

const program = anchor.workspace.TrackUpload as Program<TrackUpload>;
const creator = program.provider.wallet;
const track = anchor.web3.Keypair.generate();

describe("track_upload", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());



  it("Is initialized!", async () => {
    // Add your test here.
    const node = await create();
    const file = fs.readFileSync("tst.png");
    const file_upload = await node.add({
      path:"test",
      content: file.buffer
    })

    console.log(`UPLOADED CID: ${file_upload.cid.toString()}`)
    const tx = await program.rpc.initialize( 
      file_upload.cid.toString(),
      "BeetLes",
      "Yellow Submarinexx",
      {
      accounts: {
        creator: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        track: track.publicKey,
      },
      signers:[track]
    });
    console.log("Your transaction signature", tx);
    console.log("Track pub key", track.publicKey)
    let trackState = await program.account.track.fetch(track.publicKey);
    console.log(`TRACK:", ${String.fromCharCode(...trackState.artist)}, ${String.fromCharCode(...trackState.cid)}, ${trackState.signer} ,_ ${trackState.trackTitle} `)
    console.log(`SIGNER: ${track.publicKey}`);
    console.log(`SIGNER: ${creator.publicKey}`);
  });



});

describe("track_update",  () => {
  it("Updates", async () => {
    let trackState = await program.account.track.fetch(track.publicKey);
    const tx = await program.rpc.update(
      "QmPvAuVdiqteJF82w13sjhjqb4YNSBKohmpiv3G9FoBz22",
      {
        accounts: {
          track: track.publicKey,
          signer: creator.publicKey
        },
        signers: creator instanceof (anchor.Wallet as any) ? [] : [creator]
    }
   );
   let trackState2 = await program.account.track.fetch(track.publicKey);
   console.log(`TRACK:", ${String.fromCharCode(...trackState2.artist)}, ${String.fromCharCode(...trackState2.cid)}, ${trackState.signer} ,_ ${trackState2.trackTitle} `)   
  });
  
})

