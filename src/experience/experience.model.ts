import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';

@ObjectType('Experience')
export class ExperienceModel {
  @Field(() => ID) id!: string;
  @Field() company!: string;
  @Field() position!: string;
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Null means the start date is unknown; no date was invented.',
  })
  startDate!: Date | null;
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Null means this position is current.',
  })
  endDate!: Date | null;
  @Field() location!: string;
  @Field(() => [String]) achievements!: string[];
  @Field(() => Int) sortOrder!: number;
}
