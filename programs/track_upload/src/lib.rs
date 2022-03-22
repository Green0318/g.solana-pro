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
        emit!(TrackEvent::new(
            &track.cid,
            &track.artist,
            &track.track_title
        ));
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
        emit!(TrackEvent::new(
            &track.cid,
            &track.artist,
            &track.track_title
        ));
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
    pub signer: Pubkey,      //64
    pub cid: String,         //47
    pub artist: String,      //32
    pub track_title: String, //32
}

#[event]
pub struct TrackEvent {
    pub cid: String,
    pub artist: String,
    pub track_title: String,
}

impl TrackEvent {
    pub fn new(cid: &str, artist: &str, title: &str) -> TrackEvent {
        TrackEvent {
            cid: cid.to_string(),
            artist: artist.to_string(),
            track_title: title.to_string(),
        }
    }
}

#[error_code]
pub enum TrackError {
    #[msg("Only the original signer can update tracks.")]
    UnauthorizedUser,
    #[msg("Track should be up to 32 characters")]
    TrackTooLong,
    #[msg("Artist should be up to 32 characters")]
    ArtistTooLong,
    #[msg("CID is not valid")]
    InvalidCID,
}
