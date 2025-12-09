// src/components/TermsContent.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

export function TermsContent() {
  return (
    <View>
      {/* 1. Introdução */}
      <Text style={styles.modalSectionTitle}>1. Introdução</Text>
      <Text style={styles.modalSectionText}>
        Este aplicativo tem como finalidade permitir que usuários acompanhem, em tempo
        real, a localização aproximada dos ônibus universitários da UFRRJ, contribuindo de
        forma colaborativa com informações de localização e avistamentos. O uso do
        aplicativo implica na aceitação integral destes Termos de Uso e da Política de
        Privacidade.
      </Text>

      {/* 2. Base Legal e Consentimento */}
      <Text style={styles.modalSectionTitle}>2. Base Legal e Consentimento</Text>
      <Text style={styles.modalSectionText}>
        A coleta e o tratamento dos seus dados pessoais ocorrem com fundamento no
        consentimento expresso do usuário, conforme os artigos 7º, I, e 8º da Lei Geral de
        Proteção de Dados (Lei nº 13.709/2018 – LGPD). O consentimento pode ser revogado a
        qualquer momento pelo próprio usuário.
      </Text>

      {/* 3. Dados Pessoais Coletados */}
      <Text style={styles.modalSectionTitle}>3. Dados Pessoais Coletados</Text>
      <Text style={styles.modalSectionSubtitle}>3.1. Dados de cadastro</Text>
      <Text style={styles.modalSectionText}>
        • E-mail{'\n'}• Senha (armazenada de forma segura pelo Firebase Authentication)
      </Text>

      <Text style={styles.modalSectionSubtitle}>3.2. Dados de localização</Text>
      <Text style={styles.modalSectionText}>
        A coleta de localização ocorre apenas quando você escolhe compartilhar
        voluntariamente, em dois cenários:{'\n\n'}• Localização em tempo real: quando você
        informa estar dentro do ônibus.{'\n'}• Registro de avistamento: quando você marca
        manualmente um ponto no mapa ao visualizar um ônibus.{'\n\n'}O aplicativo não
        coleta localização em segundo plano e não coleta a localização contínua sem sua
        ação explícita.
      </Text>

      <Text style={styles.modalSectionSubtitle}>3.3. Informações técnicas</Text>
      <Text style={styles.modalSectionText}>
        • Modelo e versão do dispositivo{'\n'}• Versão do aplicativo{'\n'}• Identificador
        do usuário gerado automaticamente (UID Firebase)
      </Text>

      {/* 4. Finalidade */}
      <Text style={styles.modalSectionTitle}>4. Finalidade do Tratamento dos Dados</Text>
      <Text style={styles.modalSectionText}>
        Os dados são utilizados exclusivamente para:{'\n\n'}
        1. Exibir ao usuário a movimentação aproximada dos ônibus.{'\n'}
        2. Permitir que outros usuários visualizem avistamentos de ônibus próximos.{'\n'}
        3. Garantir segurança, autenticação e prevenção de fraudes.{'\n'}
        4. Cumprir obrigações legais, caso necessário.{'\n\n'}
        Nenhum dado é utilizado para publicidade, venda de informações ou monitoramento
        pessoal.
      </Text>

      {/* 5. Compartilhamento */}
      <Text style={styles.modalSectionTitle}>5. Compartilhamento dos Dados</Text>
      <Text style={styles.modalSectionText}>
        Os seus dados não são compartilhados com terceiros, exceto:{'\n\n'}•
        Google/Firebase, plataforma utilizada para autenticação e armazenamento.{'\n'}•
        Autoridades competentes, somente em caso de ordem judicial ou obrigação legal.
        {'\n\n'}O aplicativo não compartilha sua identidade ao exibir localizações ou
        avistamentos — apenas coordenadas, direção e horário.
      </Text>

      {/* 6. Armazenamento e Segurança */}
      <Text style={styles.modalSectionTitle}>6. Armazenamento e Segurança dos Dados</Text>
      <Text style={styles.modalSectionText}>
        Os dados são armazenados de forma segura no Firebase Authentication e Firebase
        Realtime Database, fornecedores que seguem padrões internacionais de segurança.
        {'\n\n'}
        Os dados de localização possuem tempo de vida reduzido:{'\n'}• Avistamentos
        expiram após 10 minutos.{'\n'}• Posições de compartilhamento em tempo real são
        removidas ao encerrar o compartilhamento.{'\n\n'}
        Medidas aplicadas incluem conexões criptografadas (HTTPS), regras de segurança no
        banco e controle de acesso individualizado.
      </Text>

      {/* 7. Direitos do Usuário */}
      <Text style={styles.modalSectionTitle}>7. Direitos do Usuário (LGPD)</Text>
      <Text style={styles.modalSectionText}>
        Você possui, a qualquer momento, os direitos previstos na LGPD, incluindo:{'\n\n'}
        • Confirmar se tratamos seus dados.{'\n'}• Acessar seus dados pessoais.{'\n'}•
        Corrigir dados incompletos ou incorretos.{'\n'}• Revogar consentimento.{'\n'}•
        Solicitar a exclusão da conta.{'\n'}• Solicitar informações sobre uso e
        compartilhamento.{'\n\n'}
        Para exercer seus direitos, basta solicitar pelo e-mail de suporte:
        contato@ufrrj-bus.app.
      </Text>

      {/* 8. Exclusão de Conta */}
      <Text style={styles.modalSectionTitle}>8. Exclusão de Conta e Dados</Text>
      <Text style={styles.modalSectionText}>
        O usuário pode excluir sua conta diretamente no aplicativo (quando implementado)
        ou solicitar por e-mail. A exclusão remove dados de cadastro, histórico de
        compartilhamento, avistamentos e identificadores técnicos associados, salvo em
        caso de obrigação legal de retenção.
      </Text>

      {/* 9. Responsabilidades do Usuário */}
      <Text style={styles.modalSectionTitle}>9. Responsabilidades do Usuário</Text>
      <Text style={styles.modalSectionText}>
        Ao utilizar o aplicativo, você concorda em:{'\n\n'}• Não fornecer dados falsos.
        {'\n'}• Não usar o aplicativo para fins ilícitos.{'\n'}• Não tentar manipular
        informações de localização.{'\n'}• Não coletar dados de outros usuários para fins
        indevidos.
      </Text>

      {/* 10. Alterações dos Termos */}
      <Text style={styles.modalSectionTitle}>10. Alterações dos Termos</Text>
      <Text style={styles.modalSectionText}>
        Podemos atualizar estes termos para melhorias no serviço ou adequações legais. O
        usuário será notificado sempre que houver alterações relevantes.
      </Text>

      {/* 11. Contato */}
      <Text style={styles.modalSectionTitle}>11. Contato</Text>
      <Text style={styles.modalSectionText}>
        Para dúvidas, solicitações ou exercício dos seus direitos sob a LGPD, entre em
        contato pelo instagram da plataforma.
      </Text>

      {/* 12. Aceite */}
      <Text style={styles.modalSectionTitle}>12. Aceite dos Termos</Text>
      <Text style={styles.modalSectionText}>
        Ao clicar em "Li e aceito", o usuário declara que leu e compreendeu estes Termos,
        concorda com o tratamento dos dados nos limites descritos e reconhece que o
        compartilhamento de localização é voluntário e limitado ao uso do aplicativo.
      </Text>
    </View>
  );
}
