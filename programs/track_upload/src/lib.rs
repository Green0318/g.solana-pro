use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod track_upload {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, cid: String, artist: String, title: String) -> Result<()> {
        let track = &mut ctx.accounts.track;
        track.signer = ctx.accounts.creator.key();
        track.artist = artist.as_bytes().to_vec();
        track.cid = cid.as_bytes().to_vec();
        track.track_title = "TITLE".as_bytes().to_vec();
        msg!(&title);
        Ok(())
    }

    pub fn update(ctx: Context<UpdateTrack>, cid: String) -> Result<()> {
        let track = &mut ctx.accounts.track;
        require!(ctx.accounts.signer.key() == track.signer, TrackError::UnauthorizedUser);
        track.cid = cid.as_bytes().to_vec();
        Ok(())  
    }

}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = creator, space = 174)]
    pub track: Account<'info, Track>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTrack<'info> {
    #[account(mut, has_one = signer)]
    pub track: Account<'info, Track>,
    #[account(mut)]
    pub signer: Signer<'info>
}


#[account]
#[derive(Default)]
pub struct Track  {
    pub cid: Vec<u8>, //47
    pub artist: Vec<u8>, //32
    pub track_title: Vec<u8>, //32
    pub signer: Pubkey //64
}


#[error_code]
pub enum TrackError {
    UnauthorizedUser
}