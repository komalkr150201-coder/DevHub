import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../state/auth_state.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class PortfolioScreen extends StatefulWidget {
  const PortfolioScreen({super.key});

  @override
  State<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen>
    with SingleTickerProviderStateMixin {
  final name = TextEditingController();
  final headline = TextEditingController();
  final bio = TextEditingController();
  final website = TextEditingController();
  final linkedin = TextEditingController();

  bool initialized = false;
  bool busy = false;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    name.dispose();
    headline.dispose();
    bio.dispose();
    website.dispose();
    linkedin.dispose();
    super.dispose();
  }

  void _initFields(u) {
    if (!initialized) {
      name.text = u.name;
      headline.text = u.headline;
      bio.text = u.bio;
      website.text = '${u.links['website'] ?? ''}';
      final existingLinkedin = '${u.links['linkedin'] ?? ''}';
      linkedin.text = existingLinkedin.isNotEmpty
          ? existingLinkedin
          : 'https://linkedin.com/in/${u.username}';
      initialized = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final u = auth.user;
    if (u == null) return const LoadingView();
    _initFields(u);

    return Scaffold(
      body: Column(
        children: [
          TabBar(
            controller: _tabController,
            indicatorColor: AppColors.violet,
            labelColor: AppColors.violet,
            unselectedLabelColor: AppColors.muted,
            tabs: const [
              Tab(icon: Icon(Icons.badge_outlined), text: 'Portfolio View'),
              Tab(icon: Icon(Icons.edit_note), text: 'Edit Profile'),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildViewTab(auth, u),
                _buildEditTab(auth),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildViewTab(AuthState auth, u) => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Panel(
            child: Column(
              children: [
                InitialAvatar(name: u.name, url: u.avatarUrl, size: 76),
                const SizedBox(height: 12),
                Text(u.name, style: Theme.of(context).textTheme.headlineMedium),
                Text('@${u.username}',
                    style: const TextStyle(color: AppColors.muted)),
                if (u.headline.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    u.headline,
                    style: const TextStyle(
                      color: AppColors.sky,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
                if (u.bio.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Text(
                    u.bio,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.muted),
                  ),
                ],
                const SizedBox(height: 16),
                Wrap(
                  spacing: 10,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    if ('${u.links['website'] ?? ''}'.isNotEmpty)
                      OutlinedButton.icon(
                        icon: const Icon(Icons.language, size: 16),
                        label: const Text('Website'),
                        onPressed: () => launchExternalUrl('${u.links['website']}'),
                      ),
                    if ('${u.links['linkedin'] ?? ''}'.isNotEmpty)
                      OutlinedButton.icon(
                        icon: const Icon(Icons.link, size: 16),
                        label: const Text('LinkedIn'),
                        onPressed: () =>
                            launchExternalUrl('${u.links['linkedin']}'),
                      ),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.open_in_new, size: 16),
                      label: const Text('Public Profile'),
                      onPressed: () =>
                          Navigator.pushNamed(context, '/u/${u.username}'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SectionTitle('Skills & Competencies'),
          const SizedBox(height: 10),
          Panel(
            child: Wrap(
              spacing: 7,
              runSpacing: 7,
              children: auth.skills
                  .map((e) => SkillPill('${e['name'] ?? ''}'))
                  .toList(),
            ),
          ),
          const SizedBox(height: 20),
          SectionTitle('Pinned Repositories'),
          const SizedBox(height: 10),
          ...auth.repos.where((r) => r.pinned).map(
                (r) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Panel(
                    onTap: () => launchExternalUrl(r.url),
                    child: Row(
                      children: [
                        const Icon(Icons.folder_open, color: AppColors.sky),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                r.name,
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              if (r.description.isNotEmpty)
                                Text(
                                  r.description,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: AppColors.muted,
                                    fontSize: 12,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        Text(
                          '★ ${r.stars}',
                          style: const TextStyle(color: AppColors.amber),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
        ],
      );

  Widget _buildEditTab(AuthState auth) => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            'Edit Developer Profile',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 5),
          const Text(
            'Update your personal bio, headline, and external social links.',
            style: TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: name,
            decoration: const InputDecoration(labelText: 'Display Name'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: headline,
            decoration: const InputDecoration(
              labelText: 'Professional Headline',
              hintText: 'e.g. Full-Stack Developer & Open Source Contributor',
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: bio,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'About You / Bio',
              hintText: 'Describe your background, interests and tools...',
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: website,
            decoration: const InputDecoration(
              labelText: 'Website / Portfolio URL',
              hintText: 'https://yourwebsite.com',
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: linkedin,
            decoration: InputDecoration(
              labelText: 'LinkedIn Profile URL (Auto-fetched)',
              hintText: 'https://linkedin.com/in/username',
              suffixIcon: IconButton(
                tooltip: 'Auto-fetch from GitHub',
                icon: const Icon(Icons.sync, color: AppColors.violet),
                onPressed: () async {
                  setState(() => busy = true);
                  try {
                    await auth.sync();
                    final updatedUser = auth.user;
                    if (updatedUser != null) {
                      name.text = updatedUser.name;
                      headline.text = updatedUser.headline;
                      bio.text = updatedUser.bio;
                      website.text = '${updatedUser.links['website'] ?? ''}';
                      final l = '${updatedUser.links['linkedin'] ?? ''}';
                      linkedin.text = l.isNotEmpty ? l : 'https://linkedin.com/in/${updatedUser.username}';
                    }
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Auto-fetched profile & LinkedIn data from GitHub!')),
                      );
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(e.toString())),
                      );
                    }
                  } finally {
                    if (mounted) setState(() => busy = false);
                  }
                },
              ),
            ),
          ),
          const SizedBox(height: 6),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              icon: const Icon(Icons.auto_awesome, size: 14, color: AppColors.violet),
              label: const Text(
                'Auto-fetch from GitHub',
                style: TextStyle(color: AppColors.violet, fontSize: 12),
              ),
              onPressed: () async {
                setState(() => busy = true);
                try {
                  await auth.sync();
                  final updatedUser = auth.user;
                  if (updatedUser != null) {
                    name.text = updatedUser.name;
                    headline.text = updatedUser.headline;
                    bio.text = updatedUser.bio;
                    website.text = '${updatedUser.links['website'] ?? ''}';
                    final l = '${updatedUser.links['linkedin'] ?? ''}';
                    linkedin.text = l.isNotEmpty ? l : 'https://linkedin.com/in/${updatedUser.username}';
                  }
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Profile & LinkedIn details fetched from GitHub!')),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(e.toString())),
                    );
                  }
                } finally {
                  if (mounted) setState(() => busy = false);
                }
              },
            ),
          ),
          const SizedBox(height: 20),
          GradientButton(
            label: 'Save Profile Changes',
            loading: busy,
            onPressed: () async {
              setState(() => busy = true);
              try {
                await auth.updateProfile({
                  'name': name.text,
                  'headline': headline.text,
                  'bio': bio.text,
                  'links': {
                    'website': website.text,
                    'linkedin': linkedin.text,
                  },
                });
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Profile saved successfully!')),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString())),
                  );
                }
              } finally {
                if (mounted) setState(() => busy = false);
              }
            },
          ),
        ],
      );
}
