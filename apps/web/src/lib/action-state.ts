/** Result shown under a form after a Server Action runs. */
export type ActionState = { error: string | null; success: string | null };

export const initialActionState: ActionState = { error: null, success: null };

export function actionError(error: string): ActionState {
  return { error, success: null };
}

export function actionSuccess(success: string): ActionState {
  return { error: null, success };
}
