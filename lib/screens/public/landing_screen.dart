import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_theme.dart';
import '../../state/auth_state.dart';
import '../../widgets/devhub_widgets.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          child: CustomScrollView(
            slivers: [
              SliverAppBar(
                floating: true,
                elevation: 0,
                backgroundColor: AppColors.bg,
                title: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        gradient: AppColors.gradient,
                        borderRadius: BorderRadius.circular(9),
                      ),
                      child: const Icon(Icons.hub_rounded,
                          color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'DevHub',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        letterSpacing: -.5,
                      ),
                    ),
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/login'),
                    child: const Text('Sign in'),
                  ),
                  const SizedBox(width: 4),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.violet,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                    ),
                    onPressed: () => Navigator.pushNamed(context, '/signup'),
                    child: const Text('Get started'),
                  ),
                  const SizedBox(width: 12),
                ],
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(22, 36, 22, 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.violet.withOpacity(.16),
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(
                            color: AppColors.violet.withOpacity(0.4),
                          ),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.auto_awesome,
                                size: 14, color: Color(0xFFD8CCFF)),
                            SizedBox(width: 6),
                            Text(
                              'YOUR DEVELOPER IDENTITY, REIMAGINED',
                              style: TextStyle(
                                color: Color(0xFFD8CCFF),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      ShaderMask(
                        shaderCallback: (bounds) => const LinearGradient(
                          colors: [Colors.white, Color(0xFFE2D9FF), AppColors.sky],
                        ).createShader(bounds),
                        child: Text(
                          'Your GitHub is your résumé.',
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(
                                fontSize: 38,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: -0.8,
                              ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'DevHub turns your real coding activity into a living, auto-updating portfolio — and uses intelligent matching algorithms to connect developers with complementary project teammates.',
                        style: TextStyle(
                          fontSize: 16,
                          color: AppColors.muted,
                          height: 1.55,
                        ),
                      ),
                      const SizedBox(height: 28),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        children: [
                          GradientButton(
                            label: 'Get started for free',
                            icon: Icons.arrow_forward_rounded,
                            onPressed: () =>
                                Navigator.pushNamed(context, '/signup'),
                          ),
                          OutlinedButton.icon(
                            icon: const Icon(Icons.rocket_launch_outlined,
                                color: AppColors.sky),
                            label: const Text('Try demo account'),
                            onPressed: () async {
                              try {
                                await context
                                    .read<AuthState>()
                                    .demoLogin('asha');
                                if (context.mounted) {
                                  Navigator.pushReplacementNamed(
                                      context, '/app');
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text(e.toString())),
                                  );
                                }
                              }
                            },
                          ),
                        ],
                      ),

                      const SizedBox(height: 40),

                      // Interactive Showcase Card Preview
                      const _ShowcaseCard(),

                      const SizedBox(height: 48),

                      Text(
                        'Everything you need to build & collaborate',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const SizedBox(height: 16),

                      const _Feature(
                        Icons.auto_awesome,
                        'Living Portfolio',
                        'Auto-ingests repositories, language byte share, stars, forks and contribution streaks via the GitHub API.',
                      ),
                      const SizedBox(height: 12),
                      const _Feature(
                        Icons.psychology_alt_outlined,
                        'Intelligent Teammate Matcher',
                        'Ranks candidate developers using coverage, cosine vector similarity, and activity signals.',
                      ),
                      const SizedBox(height: 12),
                      const _Feature(
                        Icons.handshake_outlined,
                        'Project Boards & Invitations',
                        'Post team requirements, discover recommended teammates, send collaboration requests, and unlock contact details.',
                      ),
                      const SizedBox(height: 12),
                      const _Feature(
                        Icons.auto_fix_high_outlined,
                        'AI Portfolio Studio',
                        'Generate a polished, executive developer portfolio tailored with custom creative direction.',
                      ),

                      const SizedBox(height: 48),

                      // Metric Stats Banner
                      Panel(
                        padding: const EdgeInsets.all(20),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _MetricItem('100%', 'Automated Skills'),
                            _MetricItem('0', 'Manual Updates'),
                            _MetricItem('Live', 'GitHub Sync'),
                          ],
                        ),
                      ),

                      const SizedBox(height: 40),
                      Center(
                        child: Column(
                          children: [
                            const Text(
                              'Ready to showcase your work?',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            GradientButton(
                              label: 'Create your portfolio now',
                              onPressed: () =>
                                  Navigator.pushNamed(context, '/signup'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
}

class _MetricItem extends StatelessWidget {
  final String value, label;
  const _MetricItem(this.value, this.label);

  @override
  Widget build(BuildContext context) => Column(
        children: [
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: AppColors.violet,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: AppColors.muted),
          ),
        ],
      );
}

class _ShowcaseCard extends StatelessWidget {
  const _ShowcaseCard();

  @override
  Widget build(BuildContext context) => Panel(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const InitialAvatar(
                  name: 'Asha Sharma',
                  url: 'https://avatars.githubusercontent.com/u/101?v=4',
                  size: 48,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Asha Sharma',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const Text(
                        'Full-Stack Developer @ashasharma',
                        style: TextStyle(color: AppColors.muted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                const MatchBadge(score: 87),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              'Building scalable web & cloud applications. 12 repos, 48 stars, 42-day commit streak.',
              style: TextStyle(color: AppColors.muted, fontSize: 13),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: const [
                SkillPill('React', selected: true),
                SkillPill('Node.js', selected: true),
                SkillPill('TypeScript'),
                SkillPill('MongoDB'),
                SkillPill('Docker'),
              ],
            ),
          ],
        ),
      );
}

class _Feature extends StatelessWidget {
  final IconData icon;
  final String title, desc;

  const _Feature(this.icon, this.title, this.desc);

  @override
  Widget build(BuildContext context) => Panel(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: AppColors.gradient,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 5),
                  Text(desc, style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
          ],
        ),
      );
}
