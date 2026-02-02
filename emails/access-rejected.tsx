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

interface AccessRejectedProps {
    name: string;
    reason?: string;
}

export const AccessRejected = ({
    name,
    reason = 'Documentação ilegível ou inválida.',
}: AccessRejectedProps) => {
    return (
        <Html>
            <Head />
            <Preview>Atualização sobre sua solicitação de acesso.</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Atualização do Processo
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Olá <strong>{name}</strong>,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Analisamos o comprovante enviado e infelizmente não pudemos validar seu acesso neste momento.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px] bg-red-50 p-4 rounded border border-red-100">
                            <strong>Motivo:</strong> {reason}
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Por favor, entre em contato conosco ou envie um novo documento que comprove sua habilitação profissional ou a compra do curso.
                        </Text>

                        <Section className="text-center mt-[24px] mb-[24px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`}
                            >
                                Reenviar Certificado
                            </Button>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Atenciosamente,<br />
                            Equipe MAF
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default AccessRejected;
