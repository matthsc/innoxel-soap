export function mergeModuleLists(...responses: string[]): string {
  if (responses.length === 0) return "";
  if (responses.length === 1) return responses[0];

  let start = "";
  let end = "";
  const modules: string[] = [];

  const moduleListStartString = "<u:moduleList>";
  const moduleListEndString = "</u:moduleList>";

  for (const response of responses) {
    const moduleListStartIndex = response.indexOf(moduleListStartString);
    const moduleListEndIndex = response.indexOf(moduleListEndString);

    if (modules.length === 0) {
      start = response.substring(
        0,
        moduleListStartIndex + moduleListStartString.length,
      );
      end = response.substring(moduleListEndIndex);
    }

    modules.push(
      response.substring(
        moduleListStartIndex + moduleListStartString.length,
        moduleListEndIndex,
      ),
    );
  }

  return start + modules.join("") + end;
}
