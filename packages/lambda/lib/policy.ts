import { PolicyStatement } from 'iam-floyd';

export class Policy {

  public static document(statement: PolicyStatement): string {
    return JSON.stringify({
      'Version': "2012-10-17",
      "Statement": [statement]
    })
  }
}