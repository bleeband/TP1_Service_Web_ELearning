import axios from "axios";

type DeepLResponse = {
  translations?: Array<{
    text: string;
  }>;
};

export function deeplEstConfigure() {
  return Boolean(process.env.DEEP_L_API || process.env.DEEPL_AUTH_KEY);
}

export async function traduireVersFrancais(textes: string[]) {
  const cle = process.env.DEEP_L_API || process.env.DEEPL_AUTH_KEY;

  if (!cle) {
    throw new Error("DEEP_L_API manquant");
  }

  const endpoint =
    process.env.DEEPL_API_URL || "https://api-free.deepl.com/v2/translate";

  const reponse = await axios.post<DeepLResponse>(
    endpoint,
    {
      text: textes,
      target_lang: "FR",
    },
    {
      headers: {
        Authorization: `DeepL-Auth-Key ${cle}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    },
  );

  const traductions = reponse.data.translations?.map(
    (traduction) => traduction.text,
  );

  if (!traductions || traductions.length !== textes.length) {
    throw new Error("Réponse DeepL incomplète");
  }

  return traductions;
}
