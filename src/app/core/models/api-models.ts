export interface ChampionshipDto {
    id?: number;
    orgId?: number;
    name?: string | null;
    startDate?: string;
    endDate?: string | null;
}

export interface EventDto {
    id?: number;
    matchId?: number;
    playerId?: number;
    eventTypeId?: number;
    eventTime?: string;
}

export interface EventTypeDto {
    id?: number;
    name?: string | null;
}

export interface LoginRequestDto {
    email?: string | null;
    password?: string | null;
}

export interface MatchDto {
    id?: number;
    orgId?: number;
    teamAId?: string;
    teamBId?: string;
    date?: string;
    championshipId?: number | null;
}

export interface OrganizationDto {
    id?: number;
    name?: string | null;
    imagePath?: string | null;
    createdAt?: string;
}

export interface PlayerDto {
    id?: number;
    name?: string | null;
    orgId?: number;
    roleId?: number;
    skill?: number | null;
    physique?: number | null;
    phone?: string | null;
    email?: string | null;
    imagePath?: string | null;
    birthDate?: string | null;
    createdAt?: string;
}

export interface PlayersPrizeDto {
    id?: number;
    playerId?: number;
    prizeTypeId?: number;
    receiveDate?: string;
}

export interface PrizeTypeDto {
    id?: number;
    name?: string | null;
}

export interface ProblemDetails {
    type?: string | null;
    title?: string | null;
    status?: number | null;
    detail?: string | null;
    instance?: string | null;
    [key: string]: any;
}

export interface RoleDto {
    id?: number;
    acronym?: string | null;
    name?: string | null;
}

export interface SalvarChampionshipDto {
    orgId: number;
    name: string;
    startDate: string;
    endDate?: string | null;
}

export interface SalvarEventDto {
    matchId: number;
    playerId: number;
    eventTypeId: number;
    eventTime: string;
}

export interface SalvarEventTypeDto {
    name: string;
}

export interface SalvarMatchDto {
    orgId: number;
    teamAId: string;
    teamBId: string;
    date: string;
    championshipId?: number | null;
}

export interface SalvarOrganizationDto {
    name: string;
    imagePath?: string | null;
}

export interface SalvarPlayerDto {
    name: string;
    orgId: number;
    roleId: number;
    skill?: number | null;
    physique?: number | null;
    phone?: string | null;
    email?: string | null;
    imagePath?: string | null;
    birthDate?: string | null;
}

export interface SalvarPlayersPrizeDto {
    playerId: number;
    prizeTypeId: number;
    receiveDate: string;
}

export interface SalvarPrizeTypeDto {
    name: string;
}

export interface SalvarRoleDto {
    acronym: string;
    name: string;
}

export interface SalvarTeamDto {
    orgId: number;
    name: string;
}

export interface SalvarUserDto {
    email: string;
    password?: string; // Made optional to match common patterns, but required in swagger. Keeping as string.
}

export interface TeamDto {
    id?: string;
    orgId?: number;
    name?: string | null;
    createdAt?: string;
}

export interface TeamPlayerDto {
    teamId?: string;
    playerId?: number;
    joinDate?: string;
}

export interface UserDto {
    id?: number;
    email?: string | null;
    createdAt?: string;
}

export interface UsersOrganizationDto {
    userId?: number;
    orgId?: number;
    admin?: boolean;
}
