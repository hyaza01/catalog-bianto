import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateLeadNotesDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;
}
