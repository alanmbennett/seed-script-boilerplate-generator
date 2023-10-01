export default function theoryTest<TType>(
    parameters: TType[],
    title: (parameter: TType) => string,
    testBody: (parameter: TType) => Mocha.Func,
) {
    parameters.forEach(parameter =>
    {
        test(title(parameter), testBody(parameter));
    });
}