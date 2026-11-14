import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

// API enum is deliberately independent of Prisma's generated representation.
export enum LinkType {
  GITHUB = 'GITHUB',
  LINKEDIN = 'LINKEDIN',
  TELEGRAM = 'TELEGRAM',
  WEBSITE = 'WEBSITE',
  EMAIL = 'EMAIL',
}
registerEnumType(LinkType, { name: 'LinkType' });

@ObjectType('ProfileLink')
export class ProfileLinkModel {
  @Field(() => LinkType) type!: LinkType;
  @Field() url!: string;
  @Field(() => Int) sortOrder!: number;
}

@ObjectType('Profile')
export class ProfileModel {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field() location!: string;
  @Field(() => [String]) languages!: string[];
  // Relations are declared by their domain's @ResolveField, not eagerly loaded.
}
