let promptMap: any = {};

const prompt = ({message}) => {
    return promptMap[message];
};

export const utilsMock = {
    promptInput: prompt,
    promptSelect: prompt,
    promptConfirm: prompt,
    setPromptMock: (map: any) => {
        promptMap = map;
    }
};
