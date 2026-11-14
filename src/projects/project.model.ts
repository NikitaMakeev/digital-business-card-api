import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Project')
export class ProjectModel {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() url!: string;
  @Field() description!: string;
  @Field(() => String, {
    nullable: true,
    description: 'Null when no separate contribution was supplied.',
  })
  contribution!: string | null;
  @Field(() => [String], {
    description: 'Ordered tags; empty when none were supplied.',
  })
  tags!: string[];
  @Field(() => Int) sortOrder!: number;
}
