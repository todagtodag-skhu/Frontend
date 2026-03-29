export async function signInWithApple() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    user: {
      provider: 'apple',
    },
  };
}
