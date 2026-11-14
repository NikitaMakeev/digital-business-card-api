import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Skill')
export class SkillModel {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() category!: string;
  @Field(() => Int) sortOrder!: number;
}

@ObjectType('SkillGroup')
export class SkillGroupModel {
  @Field() category!: string;
  @Field(() => Int) sortOrder!: number;
  @Field(() => [SkillModel]) skills!: SkillModel[];
}
