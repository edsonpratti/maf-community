import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface AccessApprovedProps {
    name: string;
    loginUrl?: string;
}

export const AccessApproved = ({
    name,
    loginUrl = 'http://localhost:3000/login',
}: AccessApprovedProps) => {
    return (
        <Html>
            <Head />
            <Preview>Sua habilitação foi verificada com sucesso! 🎉</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Bem-vinda à Comunidade <strong>MAF</strong>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Olá <strong>{name}</strong>,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Temos o prazer de informar que sua documentação profissional foi analisada e <strong>aprovada</strong> pela nossa equipe.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Agora você tem acesso completo a todos os materiais exclusivos, discussões e benefícios da nossa comunidade de Mulheres de Alta Frequência.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={loginUrl}
                            >
                                Acessar Comunidade Agora
                            </Button>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Se tiver alguma dúvida ou precisar de suporte, estamos à disposição.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Com carinho,<br />
                            Equipe MAF
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default AccessApproved;
