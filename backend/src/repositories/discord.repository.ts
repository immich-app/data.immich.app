// Discord API doesn't work with fetch-retry wrapper in TSX environment
// Use native fetch for all Discord API calls

export interface DiscordGuildData {
  id: string;
  name: string;
  icon?: string;
  banner?: string;
  premium_tier: number;
  premium_subscription_count: number;
  approximate_member_count: number;
  approximate_presence_count: number;
}

export interface DiscordInviteResponse {
  code: string;
  guild: DiscordGuildData;
  approximate_member_count: number;
  approximate_presence_count: number;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface DiscordMember {
  user?: DiscordUser;
  nick?: string | null;
  avatar?: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string | null;
}

export class DiscordRepository {
  private readonly apiBase = 'https://discord.com/api/v9';
  private readonly userAgent = 'Mozilla/5.0 (compatible; ImmichDataBot/1.0)';

  async getGuildInfo(guildId: string, botToken: string): Promise<any> {
    const url = `${this.apiBase}/guilds/${guildId}?with_counts=true`;

    // Use native fetch for Discord API to avoid fetch-retry issues
    const response = await fetch(url, {
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Discord API Error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch guild info: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async getGuildStats(inviteCode: string = 'immich'): Promise<DiscordInviteResponse> {
    const url = `${this.apiBase}/invites/${inviteCode}?with_counts=true&with_expiration=true`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Discord data: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<DiscordInviteResponse>;
  }

  async getGuildMembers(guildId: string, botToken: string, limit = 1000, after?: string): Promise<DiscordMember[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(after && { after }),
    });

    const url = `${this.apiBase}/guilds/${guildId}/members?${params}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Discord API Error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch guild members: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json() as Promise<DiscordMember[]>;
  }
}
