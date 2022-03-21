# Solana Track Upload
This exercise aims at uploading a track to IPFS and then persisting the track's CID along with some track metadata to the Solana blockchain.
Users can later access their track using the public key of the track.

## Installation
### Assumptions
- You have the dependencies to run an anchor project.
- You need to have - Rust, Solana, Yarn and Anchor installed.
- You can also find [instructions to get set up.](https://project-serum.github.io/anchor/getting-started/installation.html)

### Running the project
- All commands need to br run from the project root.
- Build the project using `anchor build`
- Start a localnet using `anchor localnet`. We will be using the localnet for our purposes for now.
- Tests - `anchor test`
- Deploy - `anchor deploy`
- Install CLI dependencies by running `yarn`
- Set Enviromnent Variables
- Ensure you have a solana key genereated. One can be using `solana-keygen new`
- Check your keypair and its location using `solana config get keypair`
- `export ANCHOR_PROVIDER_URL="http://localhost:8899"`
- `export ANCHOR_WALLET=~/.config/solana/id.json`
Once you have the project deployed and the environment variables set you can interact with it using the CLI.

## CLI
I have added the CLI scripts to the scripts section in `package.json` making it more convenient to run.
### Upload Track
Uploads a given CID to Solana. Additionaly we can have the utility upload a track to IPFS, and persist the CID to solana. If `--cid` argument is passed then the CID is used. We can instead pass a `--path` argument to upload to IPFS and persist the path. 
Do make a note of the track key since we will be using this to get the track.
```
➜  track_upload git:(master) ✗ yarn upload_track --help

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -c, --cid                                             [string] [default: null]
  -p, --path                                            [string] [default: null]
  -a, --artist                                            [string] [default: ""]
  -t, --title                                             [string] [default: ""]
```
E.g.
```
yarn upload_track --path track.mp3 --title "My Sample" --artist "TrackArtist"
```

### Get Track 
We can get a track metadata (Artist, Title, CID) from Solana and also get the track from IPFS. This needs the public key from the previous step.

```
➜  track_upload git:(master) ✗ yarn get_track --help
Options:
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -k, --key                                                  [string] [required]
  -d, --download                                       [boolean] [default: true]
```
E.g.
```
yarn get_track -k D8sQycBUZkvpLM12bFpZ4GShb3tbMvPyXLe5J5boo85W
```

### Update Track 
Update a track be passing it the existing public key and new values for CID, Title, Artist.

```
➜  track_upload git:(master) ✗ yarn update_track 

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -k, --key                                                  [string] [required]
  -c, --cid                                             [string] [default: null]
  -p, --path                                            [string] [default: null]
  -a, --artist                                            [string] [default: ""]
  -t, --title                                             [string] [default: ""]
```

E.g.
```
yarn update_track -k D8sQycBUZkvpLM12bFpZ4GShb3tbMvPyXLe5J5boo85W -a "New Artist"
```

## Soteria security analysis
I ran soteria to ensure there we no vulnerabilities detected in my contract

```
The project creates multiple executables. Please select one from the list below
to detect races. 

In the future, you can specify the executable using the option "-e" if you know 
which ones you want to analyze. 

    coderrect -e executable_name1,executable_name2 your_build_command_line

..... (omitted output)

Analyzing /home/anant/auduis/track_upload/.coderrect/build/bpfel-unknown-unknown/release/deps/track_upload.ll ...
 - ✔ [00m:00s] Loading IR From File                    
 - ▖ [00m:00s] Running Compiler Optimization Passes          
EntryPoints:
entrypoint
 - ✔ [00m:00s] Running Compiler Optimization Passes                                    
 - ✔ [00m:00s] Running Pointer Analysis                        
 - ✔ [00m:00s] Building Static Happens-Before Graph                                    
 - ✔ [00m:00s] Detecting Vunerabilities                        
detected 0 untrustful accounts in total.
detected 0 unsafe math operations in total.

--------The summary of potential vulnerabilities in track_upload.ll--------

	No vulnerabilities detected


anant@desktop:~/auduis/track_upload$ 

```

## Tests
The tests are written using mocha which is typical for anchor. 
These tests directly test uploading a track and updating a track.
To update the track we first need to get the uploaded track so it implicitly tests that as well. We also test updating a track with a different signer and it fails.
To run tests run: 
`anchor test`

## Anchor
This was built using the Anchor toolkit. It gives a opinionated structure to the solana program. It providesus several utilities such as `anchor test`, `anchor deploy`, `anchor localnet`. 
Anchor also provides us utilities in rust to simplify our code by handling lot of the Serialization, deserialization of data, instructions etc. 
On the web3 side it provides convenient utilities to interact with solana programs without having to interact directly with the idl. It also provides utilities around keypair generation, getting accounts, programs etc. Making it a lot easier to build.

## Contract Logic
The contract takes an account for the track that contains the CID, Artist, Track Title, and the signer. 
#### Initialization
The initilization logic accepts a track (Pub key for track account). We also pass in the Title, Artist and CID to be stored. These are presisted to the account.

#### Update
Update accepts modified CID, Artist, Title and modifies the track account.
These are accepted as "Optional" By checking if the vecror is of size 0. Idealy this would be done using Option<String> but that was giving some issues with serialization.

#### `Vec<u8>` types
The Cid, Track and artist are stored using Vectors that have a variable length. 
This would mean that for any production code length verification of the inputs would be necessary to make sure the account does not overflow.

#### The update logic
During update we check to make sure if the call has been signed by the original signer. This is done to ensure others can not modify tracks.

## Missing Stuff
- Vec types need better length control for any production use as this will cause the account to run out of space.

## Structure
- Anchor.toml defines the anchor project.
- package.json defines the node project.
- tsconfig.json sets up typescript.
- The `program` directory contains the Rust code for the solana program
- When we run anchor build - output goes to the target directory
- Tests are in the `tests` directory
- The app directory typically is for UI code but I am using it for the CLI code.

