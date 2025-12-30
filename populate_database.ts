/**
 * Script para popular o banco de dados Supabase com os dados do curso mock
 * 
 * Uso:
 * 1. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
 * 2. Execute: npx tsx populate_database.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { COURSE_DATA } from './constants';

// Carregar variáveis de ambiente do arquivo .env
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
// Tentar usar service_role key primeiro (bypassa RLS), senão usa anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas');
    console.error('   Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY) no .env');
    process.exit(1);
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('🔑 Usando SERVICE_ROLE key (admin - bypassa RLS)');
} else {
    console.log('⚠️  Usando ANON key (pode ter problemas de RLS)');
    console.log('   Recomendado: adicione SUPABASE_SERVICE_ROLE_KEY no .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateDatabase() {
    console.log('🚀 Iniciando população do banco de dados...\n');

    try {
        // 1. Limpar dados existentes (em ordem reversa devido às foreign keys)
        console.log('🧹 Limpando dados existentes...');
        await supabase.from('quiz_options').delete().neq('id', '');
        await supabase.from('quizzes').delete().neq('id', '');
        await supabase.from('materials').delete().neq('id', '');
        await supabase.from('lessons').delete().neq('id', '');
        await supabase.from('modules').delete().neq('id', '');
        await supabase.from('courses').delete().eq('id', COURSE_DATA.id);
        console.log('✅ Dados antigos removidos\n');

        // 2. Inserir o curso
        console.log('📚 Inserindo curso:', COURSE_DATA.title);
        const { error: courseError } = await supabase.from('courses').insert({
            id: COURSE_DATA.id,
            title: COURSE_DATA.title,
            course_cover_url: COURSE_DATA.courseCoverUrl,
            certificate_config: COURSE_DATA.certificateConfig
        });

        if (courseError) throw courseError;
        console.log('✅ Curso inserido\n');

        // 3. Inserir módulos, aulas, materiais e quizzes
        for (let moduleIndex = 0; moduleIndex < COURSE_DATA.modules.length; moduleIndex++) {
            const module = COURSE_DATA.modules[moduleIndex];
            console.log(`📖 Módulo ${moduleIndex + 1}/${COURSE_DATA.modules.length}: ${module.title}`);

            // Inserir módulo
            const { error: moduleError } = await supabase.from('modules').insert({
                id: module.id,
                course_id: COURSE_DATA.id,
                title: module.title,
                description: module.description,
                is_locked: module.isLocked,
                is_active: module.isActive,
                order_index: moduleIndex
            });

            if (moduleError) throw moduleError;

            // Inserir aulas do módulo
            for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
                const lesson = module.lessons[lessonIndex];
                console.log(`  📝 Aula ${lessonIndex + 1}/${module.lessons.length}: ${lesson.title}`);

                const { error: lessonError } = await supabase.from('lessons').insert({
                    id: lesson.id,
                    module_id: module.id,
                    title: lesson.title,
                    description: lesson.description,
                    video_id: lesson.videoId,
                    duration: lesson.duration,
                    content: lesson.content,
                    is_active: lesson.isActive,
                    order_index: lessonIndex
                });

                if (lessonError) throw lessonError;

                // Inserir materiais da aula
                if (lesson.materials && lesson.materials.length > 0) {
                    const materialsData = lesson.materials.map(material => ({
                        id: material.id,
                        lesson_id: lesson.id,
                        title: material.title,
                        url: material.url,
                        type: material.type
                    }));

                    const { error: materialsError } = await supabase.from('materials').insert(materialsData);
                    if (materialsError) throw materialsError;
                    console.log(`    📎 ${lesson.materials.length} materiais inseridos`);
                }

                // Inserir quiz da aula
                if (lesson.quiz) {
                    const { error: quizError } = await supabase.from('quizzes').insert({
                        id: lesson.quiz.id,
                        lesson_id: lesson.id,
                        question: lesson.quiz.question
                    });

                    if (quizError) throw quizError;

                    // Inserir opções do quiz
                    const optionsData = lesson.quiz.options.map(option => ({
                        id: option.id,
                        quiz_id: lesson.quiz!.id,
                        text: option.text,
                        is_correct: option.isCorrect
                    }));

                    const { error: optionsError } = await supabase.from('quiz_options').insert(optionsData);
                    if (optionsError) throw optionsError;
                    console.log(`    ❓ Quiz inserido com ${lesson.quiz.options.length} opções`);
                }
            }

            console.log(`✅ Módulo ${module.title} completo\n`);
        }

        console.log('🎉 População do banco de dados concluída com sucesso!');
        console.log(`\n📊 Resumo:`);
        console.log(`   - 1 curso`);
        console.log(`   - ${COURSE_DATA.modules.length} módulos`);
        const totalLessons = COURSE_DATA.modules.reduce((sum, m) => sum + m.lessons.length, 0);
        console.log(`   - ${totalLessons} aulas`);
        const totalMaterials = COURSE_DATA.modules.reduce((sum, m) =>
            sum + m.lessons.reduce((s, l) => s + (l.materials?.length || 0), 0), 0);
        console.log(`   - ${totalMaterials} materiais`);
        console.log(`   - ${totalLessons} quizzes`);

    } catch (error: any) {
        console.error('\n❌ Erro ao popular banco de dados:', error.message);
        console.error('Detalhes:', error);
        process.exit(1);
    }
}

// Executar
populateDatabase();
