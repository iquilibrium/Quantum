
import { Course, User } from './types';

export const MOCK_USER: User = {
  id: 'user_001',
  name: 'Alexandre Estudante',
  email: 'alex@quantum.edu',
  avatarUrl: 'https://picsum.photos/200',
  role: 'student',
  isActive: true,
  progress: 5,
  points: 120,
  level: 1,
  badges: ['Iniciado'],
  completedLessons: ['l_1_1'],
  lastAccess: '2023-10-25'
};

export const MOCK_STUDENTS: User[] = [
  MOCK_USER,
  {
    id: 'user_002',
    name: 'Mariana Silva',
    email: 'mariana@email.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    role: 'student',
    isActive: true,
    progress: 45,
    points: 850,
    level: 4,
    badges: ['Iniciado', 'Explorador', 'Mestre do Foco'],
    completedLessons: ['l_1_1', 'l_1_2', 'l_1_3', 'l_2_1', 'l_2_2'],
    lastAccess: '2023-10-24'
  },
  {
    id: 'user_003',
    name: 'João Pedro',
    email: 'joao.p@email.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    role: 'student',
    isActive: false, // Desativado
    progress: 10,
    points: 200,
    level: 2,
    badges: ['Iniciado'],
    completedLessons: ['l_1_1', 'l_1_2'],
    lastAccess: '2023-09-15'
  },
  {
    id: 'user_004',
    name: 'Sofia Luz',
    email: 'sofia.luz@quantum.edu',
    avatarUrl: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
    role: 'student',
    isActive: true,
    progress: 88,
    points: 1200,
    level: 6,
    badges: ['Iniciado', 'Hermetista', 'Vibracional'],
    completedLessons: ['l_1_1'], // Simplificado para mock
    lastAccess: 'Hoje'
  }
];

export const COURSE_DATA: Course = {
  id: 'c_quantum_full',
  title: 'Mecânica Quântica, Vibração e as 7 Leis Herméticas',
  certificateConfig: {
    title: 'Certificado',
    subtitle: 'de conclusão',
    bodyText: 'Este certificado é orgulhosamente concedido a',
    signerName: 'Dr. Hermes Trismegisto',
    signerRole: 'Diretor Acadêmico Quantum',
    institutionName: 'Quantum',
    primaryColor: '#7c3aed', // brand-600
    displaySeal: true
  },
  modules: [
    {
      id: 'm_1',
      title: 'Módulo 1: Fundamentos da Realidade',
      description: 'Compreenda como a percepção e o observador moldam a experiência da realidade.',
      isLocked: false,
      isActive: true,
      lessons: [
        {
          id: 'l_1_1',
          title: 'O Que Chamamos de Realidade?',
          description: 'A realidade não é apenas o que existe fora, mas como interpretamos.',
          videoId: 'z1D05k8l-fM', // Placeholder
          duration: '10 min',
          content: `Quando falamos em realidade, geralmente pensamos no mundo físico: objetos, pessoas e acontecimentos. Porém, a realidade não é apenas aquilo que existe fora de nós, mas também a forma como interpretamos o que existe.

Cada pessoa percebe o mundo através de filtros como crenças, emoções, experiências passadas e expectativas. Por isso, duas pessoas podem viver a mesma situação e ter experiências completamente diferentes.

A ciência moderna mostra que aquilo que observamos não é apenas o objeto em si, mas o resultado da interação entre o observador e o observado. Compreender a realidade começa por compreender como percebemos.`,
          isActive: true,
          quiz: {
            id: 'q_1_1',
            question: 'O que mais influencia a forma como percebemos a realidade?',
            options: [
              { id: 'opt_1', text: 'Apenas os fatos externos', isCorrect: false },
              { id: 'opt_2', text: 'A percepção, crenças e emoções', isCorrect: true },
              { id: 'opt_3', text: 'O acaso', isCorrect: false },
              { id: 'opt_4', text: 'A sorte', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_1_2',
          title: 'Limites do Pensamento Clássico',
          description: 'Por que o modelo de universo como "máquina previsível" falhou.',
          videoId: 'A9tKnc_1',
          duration: '12 min',
          content: `Durante séculos, a ciência acreditou que o universo funcionava como uma máquina previsível. Se fosse possível conhecer todas as variáveis, seria possível prever qualquer evento.

Esse modelo funcionou muito bem para fenômenos grandes, mas começou a falhar ao estudar o mundo microscópico.

No nível dos átomos e partículas, os fenômenos não seguem regras rígidas e totalmente previsíveis. Isso mostra que o pensamento clássico é útil, mas limitado.`,
          isActive: true,
          quiz: {
            id: 'q_1_2',
            question: 'O pensamento clássico vê o universo como:',
            options: [
              { id: 'opt_1', text: 'Caótico e desordenado', isCorrect: false },
              { id: 'opt_2', text: 'Uma máquina previsível', isCorrect: true },
              { id: 'opt_3', text: 'Totalmente imprevisível', isCorrect: false },
              { id: 'opt_4', text: 'Uma ilusão mental', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_1_3',
          title: 'Observador, Percepção e Experiência',
          description: 'Como a interação entre observador e observado constrói a realidade.',
          videoId: 'obs_v3',
          duration: '15 min',
          content: `Na ciência moderna, o observador não é apenas alguém que assiste aos fenômenos. A forma como observamos e medimos influencia o resultado.

Isso não significa que a mente cria tudo do nada, mas que a observação interfere na experiência.

No cotidiano, isso é percebido quando nossas expectativas e emoções influenciam a forma como interpretamos os acontecimentos. A realidade é construída pela interação entre o que acontece e como interpretamos.`,
          isActive: true,
          quiz: {
            id: 'q_1_3',
            question: 'Na visão moderna, qual é o papel do observador?',
            options: [
              { id: 'opt_1', text: 'É irrelevante para o experimento', isCorrect: false },
              { id: 'opt_2', text: 'Apenas assiste passivamente', isCorrect: false },
              { id: 'opt_3', text: 'Pode influenciar a experiência', isCorrect: true },
              { id: 'opt_4', text: 'Controla todas as variáveis', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_1_4',
          title: 'Preparando a Mente para o Quantum',
          description: 'A atitude mental necessária para compreender o mundo quântico.',
          videoId: 'prep_v4',
          duration: '10 min',
          content: `Compreender conceitos quânticos exige flexibilidade mental. Estamos acostumados a pensar de forma linear e rígida, mas o mundo quântico funciona de maneira diferente.

O curso Quantum não pede crença cega, mas observação, reflexão e abertura para novos modelos de compreensão da realidade. Assim como aprender uma nova habilidade, compreender o Quantum exige prática mental.`,
          isActive: true,
          quiz: {
            id: 'q_1_4',
            question: 'Qual atitude é mais adequada para aprender conceitos quânticos?',
            options: [
              { id: 'opt_1', text: 'Rigidez intelectual', isCorrect: false },
              { id: 'opt_2', text: 'Ceticismo absoluto', isCorrect: false },
              { id: 'opt_3', text: 'Abertura e observação', isCorrect: true },
              { id: 'opt_4', text: 'Rejeição imediata', isCorrect: false }
            ]
          }
        }
      ]
    },
    {
      id: 'm_2',
      title: 'Módulo 2: Introdução à Mecânica Quântica',
      description: 'Conceitos fundamentais: dualidade, incerteza e probabilidade.',
      isLocked: false,
      isActive: true,
      lessons: [
        {
          id: 'l_2_1',
          title: 'O Que é Mecânica Quântica?',
          description: 'O estudo da matéria e energia em escalas atômicas.',
          videoId: 'mq_intro',
          duration: '18 min',
          content: `A Mecânica Quântica é o ramo da física que estuda o comportamento da matéria e da energia em escalas muito pequenas, como átomos e partículas subatômicas.

Ela surgiu quando a física clássica não conseguiu explicar certos fenômenos observados na natureza. É uma das teorias mais testadas da ciência e introduz a ideia de probabilidade como parte fundamental da realidade.`,
          isActive: true,
          quiz: {
            id: 'q_2_1',
            question: 'Por que a Mecânica Quântica surgiu?',
            options: [
              { id: 'opt_1', text: 'Curiosidade filosófica apenas', isCorrect: false },
              { id: 'opt_2', text: 'Falha da física clássica em explicar micro-fenômenos', isCorrect: true },
              { id: 'opt_3', text: 'Influência religiosa', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_2_2',
          title: 'Luz: Onda ou Partícula?',
          description: 'A dualidade onda-partícula e o contexto da observação.',
          videoId: 'light_dual',
          duration: '20 min',
          content: `A luz pode se comportar como onda ou como partícula, dependendo da forma como é observada. Esse fenômeno é chamado de dualidade onda-partícula.

Isso demonstra que o comportamento da luz depende do contexto da observação. Não existe uma definição fixa e imutável isolada do experimento.`,
          isActive: true,
          quiz: {
            id: 'q_2_2',
            question: 'O comportamento da luz (onda ou partícula) depende de quê?',
            options: [
              { id: 'opt_1', text: 'Do acaso', isCorrect: false },
              { id: 'opt_2', text: 'Do contexto do experimento/observação', isCorrect: true },
              { id: 'opt_3', text: 'Da temperatura do ambiente', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_2_3',
          title: 'O Experimento da Dupla Fenda',
          description: 'Como o ato de medir interfere no sistema observado.',
          videoId: 'double_slit',
          duration: '25 min',
          content: `O experimento da dupla fenda mostrou que partículas se comportam como ondas (criando padrões de interferência) quando não são observadas diretamente, e como partículas (sólidas e localizadas) quando são observadas.

Isso evidencia que o ato de medir interfere no sistema observado, alterando seu comportamento fundamental.`,
          isActive: true,
          quiz: {
            id: 'q_2_3',
            question: 'Sem observação direta no experimento, a partícula se comporta como:',
            options: [
              { id: 'opt_1', text: 'Onda', isCorrect: true },
              { id: 'opt_2', text: 'Objeto sólido', isCorrect: false },
              { id: 'opt_3', text: 'Matéria clássica', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_2_4',
          title: 'Probabilidade e Incerteza',
          description: 'Os limites fundamentais de precisão da natureza.',
          videoId: 'uncert_principle',
          duration: '15 min',
          content: `Na Mecânica Quântica, não é possível prever resultados exatos, apenas probabilidades.

O princípio da incerteza mostra que a natureza possui limites fundamentais de precisão. Isso não é causado por falhas tecnológicas de medição, mas pela própria estrutura da realidade, que é probabilística em sua base.`,
          isActive: true,
          quiz: {
            id: 'q_2_4',
            question: 'Os resultados na mecânica quântica são:',
            options: [
              { id: 'opt_1', text: 'Exatos e Determinísticos', isCorrect: false },
              { id: 'opt_2', text: 'Aleatórios sem padrão', isCorrect: false },
              { id: 'opt_3', text: 'Probabilísticos', isCorrect: true }
            ]
          }
        },
        {
          id: 'l_2_5',
          title: 'O Que a Mecânica Quântica NÃO Diz',
          description: 'Desmistificando sensacionalismos e interpretações errôneas.',
          videoId: 'mq_myths',
          duration: '12 min',
          content: `A Mecânica Quântica não afirma que "pensamentos criam tudo instantaneamente" ou que a realidade é uma "ilusão total".

Ela mostra que a realidade é mais complexa do que o modelo clássico e que o observador influencia o sistema. O foco do curso é a clareza e profundidade, evitando o sensacionalismo mágico que muitas vezes distorce a ciência.`,
          isActive: true,
          quiz: {
            id: 'q_2_5',
            question: 'A Mecânica Quântica afirma que pensamentos criam a matéria instantaneamente?',
            options: [
              { id: 'opt_1', text: 'Sim, comprova a magia', isCorrect: false },
              { id: 'opt_2', text: 'Não, essa é uma interpretação incorreta', isCorrect: true },
              { id: 'opt_3', text: 'Depende do dia', isCorrect: false }
            ]
          }
        }
      ]
    },
    {
      id: 'm_3',
      title: 'Módulo 3: Vibração e Frequência',
      description: 'O movimento fundamental do universo e a ressonância.',
      isLocked: false,
      isActive: true,
      lessons: [
        {
          id: 'l_3_1',
          title: 'Tudo Vibra',
          description: 'A vibração como propriedade fundamental da matéria.',
          videoId: 'vib_fund',
          duration: '15 min',
          content: `A ciência moderna mostra que tudo no universo está em movimento. Esse movimento gera vibração. Mesmo aquilo que parece sólido e estático a olho nu, como uma rocha ou uma mesa, está vibrando freneticamente em níveis microscópicos (atômicos e subatômicos).

A vibração é uma propriedade fundamental da matéria e da energia.`,
          isActive: true,
          quiz: {
            id: 'q_3_1',
            question: 'Segundo a ciência, o que acontece com toda matéria no universo?',
            options: [
              { id: 'opt_1', text: 'Está parada em nível atômico', isCorrect: false },
              { id: 'opt_2', text: 'Vibra constantemente', isCorrect: true },
              { id: 'opt_3', text: 'É sólida e imutável', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_3_2',
          title: 'Frequência e Ressonância',
          description: 'O alinhamento de vibrações e seus efeitos.',
          videoId: 'freq_res',
          duration: '20 min',
          content: `Frequência é a velocidade da vibração. Quando duas vibrações se alinham ou são compatíveis, ocorre o fenômeno da **ressonância**.

A ressonância explica por que certos ambientes, músicas, ideias ou pessoas nos afetam mais do que outros. Estamos "sintonizando" com aquela frequência específica, amplificando a troca de informação e energia.`,
          isActive: true,
          quiz: {
            id: 'q_3_2',
            question: 'O que é Ressonância?',
            options: [
              { id: 'opt_1', text: 'Quando vibrações se anulam', isCorrect: false },
              { id: 'opt_2', text: 'Quando vibrações se alinham', isCorrect: true },
              { id: 'opt_3', text: 'A ausência de movimento', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_3_3',
          title: 'Escalas de Vibração',
          description: 'Como as emoções e pensamentos ocupam diferentes graus de vibração.',
          videoId: 'scale_vib',
          duration: '18 min',
          content: `Entender que tudo vibra é o primeiro passo. O segundo é compreender que existem escalas de vibração.

No espectro das emoções humanas, o medo, a culpa e a vergonha vibram em frequências baixas e densas. A alegria, o amor e a gratidão vibram em frequências altas e sutis.

Mudar sua realidade não é apenas mudar ações físicas, mas alterar o estado vibracional de onde essas ações partem.`,
          isActive: true,
          quiz: {
            id: 'q_3_3',
            question: 'Qual é a diferença entre medo e alegria em termos físicos?',
            options: [
              { id: 'opt_1', text: 'São apenas palavras', isCorrect: false },
              { id: 'opt_2', text: 'Diferentes taxas de vibração/frequência', isCorrect: true },
              { id: 'opt_3', text: 'O medo é sólido, a alegria é gasosa', isCorrect: false }
            ]
          }
        }
      ]
    },
    {
      id: 'm_4',
      title: 'Módulo 4: As 7 Leis Herméticas',
      description: 'Princípios universais do Caibalion aplicados à realidade.',
      isLocked: false,
      isActive: true,
      lessons: [
        {
          id: 'l_4_1',
          title: 'Lei do Mentalismo',
          description: '"O Todo é Mente; o Universo é Mental."',
          videoId: 'law_mentalism',
          duration: '25 min',
          content: `A primeira Lei Hermética afirma que tudo começa na mente. Isso não significa que tudo é apenas imaginação humana, mas que a Consciência (O Todo) é o princípio organizador e gerador da experiência e da matéria.

O universo, em sua essência, é uma criação mental do Todo.`,
          isActive: true,
          quiz: {
            id: 'q_4_1',
            question: 'O Princípio do Mentalismo afirma que:',
            options: [
              { id: 'opt_1', text: 'A matéria não existe', isCorrect: false },
              { id: 'opt_2', text: 'A mente é o princípio fundamental', isCorrect: true },
              { id: 'opt_3', text: 'Tudo é ilusão sem regras', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_4_2',
          title: 'Lei da Correspondência',
          description: '"O que está em cima é como o que está embaixo."',
          videoId: 'law_corresp',
          duration: '20 min',
          content: `A Lei da Correspondência afirma que padrões se repetem em diferentes níveis da realidade (físico, mental e espiritual).

Ao estudar o átomo (microcosmo), podemos entender o sistema solar (macrocosmo). Ao entender nossas emoções internas, podemos entender nossos resultados externos. Há uma harmonia e correlação entre os planos de existência.`,
          isActive: true,
          quiz: {
            id: 'q_4_2',
            question: 'A Lei da Correspondência indica que:',
            options: [
              { id: 'opt_1', text: 'Nada se conecta', isCorrect: false },
              { id: 'opt_2', text: 'Tudo é exatamente igual em tamanho', isCorrect: false },
              { id: 'opt_3', text: 'Existem padrões semelhantes em diferentes níveis', isCorrect: true }
            ]
          }
        },
        {
          id: 'l_4_3',
          title: 'Lei da Vibração',
          description: '"Nada está parado; tudo se move; tudo vibra."',
          videoId: 'law_vib',
          duration: '15 min',
          content: `Este princípio hermético confirma o que a ciência moderna descobriu milênios depois: nada no universo está em repouso absoluto. A diferença entre as diversas manifestações de Matéria, Energia, Mente e Espírito resulta apenas de taxas variáveis de vibração.

Quanto mais alta a vibração, mais elevada a posição na escala.`,
          isActive: true,
          quiz: {
            id: 'q_4_3',
            question: 'O Princípio da Vibração explica as diferenças entre matéria e espírito como:',
            options: [
              { id: 'opt_1', text: 'Diferenças de substância', isCorrect: false },
              { id: 'opt_2', text: 'Diferenças de taxa vibratória', isCorrect: true },
              { id: 'opt_3', text: 'Não há relação', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_4_4',
          title: 'Lei da Polaridade',
          description: '"Tudo é Duplo; tudo tem polos; tudo tem o seu oposto."',
          videoId: 'law_pol',
          duration: '18 min',
          content: `A Lei da Polaridade ensina que os opostos são apenas extremos da mesma coisa, variando apenas em grau. Quente e frio são a mesma coisa (temperatura), apenas em graus diferentes. Amor e ódio são graus da mesma emoção.

A arte da polarização mental permite transmutar um estado mental em seu oposto, alterando sua vibração.`,
          isActive: true,
          quiz: {
            id: 'q_4_4',
            question: 'Segundo a Polaridade, o que são "quente" e "frio"?',
            options: [
              { id: 'opt_1', text: 'Coisas totalmente diferentes', isCorrect: false },
              { id: 'opt_2', text: 'A mesma coisa em graus diferentes', isCorrect: true },
              { id: 'opt_3', text: 'Ilusões sensoriais', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_4_5',
          title: 'Lei do Ritmo',
          description: '"Tudo tem fluxo e refluxo; tudo tem suas marés."',
          videoId: 'law_rhythm',
          duration: '15 min',
          content: `Tudo no universo opera em ciclos. O movimento pendular se manifesta em tudo: ascensão e queda de impérios, ciclos econômicos, marés, e nossos estados emocionais.

A medida do movimento à direita é a medida do movimento à esquerda. O sábio aprende a "neutralizar" o ritmo, elevando-se acima da oscilação para não ser arrastado pelo pêndulo emocional.`,
          isActive: true,
          quiz: {
            id: 'q_4_5',
            question: 'Como o Princípio do Ritmo se manifesta?',
            options: [
              { id: 'opt_1', text: 'Em movimentos lineares infinitos', isCorrect: false },
              { id: 'opt_2', text: 'Em ciclos, marés e movimentos pendulares', isCorrect: true },
              { id: 'opt_3', text: 'Apenas na música', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_4_6',
          title: 'Lei de Causa e Efeito',
          description: '"Toda Causa tem seu Efeito; todo Efeito tem sua Causa."',
          videoId: 'law_cause',
          duration: '22 min',
          content: `O acaso é apenas um nome dado a uma lei não reconhecida. Nada escapa à Lei. Tudo o que acontece em sua vida é um efeito de uma causa anterior (consciente ou inconsciente).

Para se tornar mestre da própria vida, deve-se deixar de ser um "efeito" das circunstâncias e tornar-se uma "causa" consciente.`,
          isActive: true,
          quiz: {
            id: 'q_4_6',
            question: 'O que é o "acaso" segundo o Hermetismo?',
            options: [
              { id: 'opt_1', text: 'Sorte aleatória', isCorrect: false },
              { id: 'opt_2', text: 'Uma lei não reconhecida ou compreendida', isCorrect: true },
              { id: 'opt_3', text: 'O destino imutável', isCorrect: false }
            ]
          }
        },
        {
          id: 'l_4_7',
          title: 'Lei do Gênero',
          description: '"O Gênero está em tudo; tudo tem o seu princípio masculino e feminino."',
          videoId: 'law_gender',
          duration: '15 min',
          content: `O Gênero se manifesta em todos os planos. No plano físico, manifesta-se como sexo; nos planos superiores, toma formas mais elevadas, mas o princípio é o mesmo: Geração, Regeneração e Criação.

Nada pode ser criado sem a união dos princípios Masculino (projetivo) e Feminino (receptivo), tanto na natureza quanto na mente humana.`,
          isActive: true,
          quiz: {
            id: 'q_4_7',
            question: 'O Princípio de Gênero é responsável por:',
            options: [
              { id: 'opt_1', text: 'Apenas a biologia', isCorrect: false },
              { id: 'opt_2', text: 'Geração, criação e regeneração em todos os planos', isCorrect: true },
              { id: 'opt_3', text: 'Divisão social', isCorrect: false }
            ]
          }
        }
      ]
    },
    {
      id: 'm_5',
      title: 'Módulo 5: Integração e Aplicação',
      description: 'Unindo os conhecimentos para uma nova visão de mundo.',
      isLocked: false,
      isActive: true,
      lessons: [
        {
          id: 'l_5_1',
          title: 'Integrando Ciência e Hermetismo',
          description: 'Modelos complementares para compreender a realidade.',
          videoId: 'integration_v1',
          duration: '30 min',
          content: `Neste módulo, integramos os conceitos científicos (Mecânica Quântica, Vibração) e filosóficos (Leis Herméticas).

Não se trata de substituir um pelo outro, mas de perceber como ambos oferecem linguagens diferentes para descrever os mesmos mecanismos da realidade. A ciência mede o externo; o hermetismo explica o princípio interno. Juntos, oferecem um mapa completo.`,
          isActive: true,
          quiz: {
            id: 'q_5_1',
            question: 'O curso Quantum busca integrar:',
            options: [
              { id: 'opt_1', text: 'Ciência e Filosofia', isCorrect: true },
              { id: 'opt_2', text: 'Religião e Crença cega', isCorrect: false },
              { id: 'opt_3', text: 'Magia e Superstição', isCorrect: false }
            ]
          }
        }
      ]
    },
    {
      id: 'm_6',
      title: 'Módulo 6: Encerramento',
      description: 'Consolidação final da jornada.',
      isLocked: false,
      isActive: true,
      lessons: [
        {
          id: 'l_6_1',
          title: 'Consolidação do Aprendizado',
          description: 'Revisão dos principais conceitos e próximos passos.',
          videoId: 'closing_v1',
          duration: '10 min',
          content: `Chegamos ao final desta jornada introdutória. Revisamos como a percepção molda a realidade, como o mundo subatômico desafia o senso comum e como leis universais regem o fluxo da vida.

O objetivo final não é decorar conceitos, mas expandir sua compreensão da realidade de forma prática, permitindo que você navegue pela vida com mais consciência e menos automatismo.`,
          isActive: true,
          quiz: {
            id: 'q_6_1',
            question: 'O objetivo final do curso é:',
            options: [
              { id: 'opt_1', text: 'Decorar fórmulas matemáticas', isCorrect: false },
              { id: 'opt_2', text: 'Expandir a compreensão da realidade', isCorrect: true },
              { id: 'opt_3', text: 'Criar novos dogmas', isCorrect: false }
            ]
          }
        }
      ]
    }
  ]
};
