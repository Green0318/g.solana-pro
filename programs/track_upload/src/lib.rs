use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod track_upload {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        cid: String,
        artist: String,
        title: String,
    ) -> Result<()> {
        let track = &mut ctx.accounts.track;
        // Validate Lengths
        require!(cid.chars().count() <= 47, TrackError::InvalidCID);
        require!(artist.chars().count() <= 32, TrackError::TrackTooLong);
        require!(title.chars().count() <= 32, TrackError::ArtistTooLong);

        track.signer = ctx.accounts.signer.key();
        track.artist = artist;
        track.cid = cid;
        track.track_title = title;

        Ok(())
    }

    // Would be prefered to take Option<String> as args but
    // running into issues with serialization
    pub fn update(
        ctx: Context<UpdateTrack>,
        cid: String,
        artist: String,
        title: String,
    ) -> Result<()> {
        let track = &mut ctx.accounts.track;
        require!(
            ctx.accounts.signer.key() == track.signer,
            TrackError::UnauthorizedUser
        );
        // Validate Lengths
        require!(cid.chars().count() <= 47, TrackError::InvalidCID);
        require!(artist.chars().count() <= 32, TrackError::TrackTooLong);
        require!(title.chars().count() <= 32, TrackError::ArtistTooLong);

        if cid.chars().count() > 0 {
            track.cid = cid
        };
        if artist.chars().count() > 0 {
            track.artist = artist
        };
        if title.chars().count() > 0 {
            track.track_title = title
        };
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 174)]
    pub track: Account<'info, Track>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTrack<'info> {
    #[account(mut, has_one = signer)]
    pub track: Account<'info, Track>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[account]
#[derive(Default)]
pub struct Track {
    pub signer: Pubkey,       //64    
    pub cid: String,         //47
    pub artist: String,      //32
    pub track_title: String, //32
}

#[error_code]
pub enum TrackError {
    UnauthorizedUser,
    TrackTooLong,
    ArtistTooLong,
    InvalidCID,
}
