import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/devhub_api.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class DevelopersScreen extends StatefulWidget {
  const DevelopersScreen({super.key});

  @override
  State<DevelopersScreen> createState() => _DevelopersScreenState();
}

class _DevelopersScreenState extends State<DevelopersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Search mode state
  final q = TextEditingController();
  List<dynamic> searchResults = [];
  bool searchLoading = false;
  String searchError = '';

  // AI Matcher state
  final List<String> availableSkills = [
    'React',
    'Node.js',
    'MongoDB',
    'Flutter',
    'TypeScript',
    'Python',
    'Docker',
    'Express',
    'Tailwind CSS',
    'PostgreSQL',
    'AWS',
  ];
  final Set<String> selectedRequired = {'React', 'Node.js'};
  final Set<String> selectedNiceToHave = {'MongoDB'};
  List<dynamic> matchResults = [];
  bool matchLoading = false;
  String matchError = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    search();
    runMatcher();
  }

  @override
  void dispose() {
    _tabController.dispose();
    q.dispose();
    super.dispose();
  }

  Future<void> search() async {
    setState(() => searchLoading = true);
    try {
      final data =
          await context.read<DevHubApi>().searchDevelopers(q: q.text.trim());
      searchResults =
          (data['users'] ?? data['developers'] ?? data['results'] ?? []) as List;
      searchError = '';
    } catch (e) {
      searchError = e.toString();
    } finally {
      if (mounted) setState(() => searchLoading = false);
    }
  }

  Future<void> runMatcher() async {
    setState(() => matchLoading = true);
    try {
      final requiredPayload = selectedRequired
          .map((s) => {'name': s, 'importance': 3})
          .toList();
      final data = await context.read<DevHubApi>().rankDevelopers(
            requiredPayload,
            niceToHave: selectedNiceToHave.toList(),
          );
      matchResults =
          (data['matches'] ?? data['results'] ?? data['developers'] ?? [])
              as List;
      matchError = '';
    } catch (e) {
      matchError = e.toString();
    } finally {
      if (mounted) setState(() => matchLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Discover developers',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Find collaborators using skill algorithms or search by name.',
                    style: TextStyle(color: AppColors.muted),
                  ),
                ],
              ),
            ),
            TabBar(
              controller: _tabController,
              indicatorColor: AppColors.violet,
              labelColor: AppColors.violet,
              unselectedLabelColor: AppColors.muted,
              tabs: const [
                Tab(
                  icon: Icon(Icons.auto_awesome, size: 18),
                  text: 'AI Matcher Engine',
                ),
                Tab(
                  icon: Icon(Icons.search, size: 18),
                  text: 'Keyword Search',
                ),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildMatcherTab(),
                  _buildSearchTab(),
                ],
              ),
            ),
          ],
        ),
      );

  Widget _buildMatcherTab() => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Select Required Skills',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: availableSkills.map((s) {
                    final isSel = selectedRequired.contains(s);
                    return ChoiceChip(
                      label: Text(s),
                      selected: isSel,
                      selectedColor: AppColors.violet,
                      onSelected: (val) {
                        setState(() {
                          if (val) {
                            selectedRequired.add(s);
                            selectedNiceToHave.remove(s);
                          } else {
                            selectedRequired.remove(s);
                          }
                        });
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 14),
                const Text(
                  'Select Nice-to-Have Skills',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: availableSkills
                      .where((s) => !selectedRequired.contains(s))
                      .map((s) {
                    final isSel = selectedNiceToHave.contains(s);
                    return ChoiceChip(
                      label: Text(s),
                      selected: isSel,
                      selectedColor: AppColors.blue,
                      onSelected: (val) {
                        setState(() {
                          if (val) {
                            selectedNiceToHave.add(s);
                          } else {
                            selectedNiceToHave.remove(s);
                          }
                        });
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
                GradientButton(
                  label: 'Rank Teammates',
                  icon: Icons.auto_awesome,
                  loading: matchLoading,
                  onPressed: runMatcher,
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          if (matchLoading) const Center(child: CircularProgressIndicator()),
          if (matchError.isNotEmpty)
            Text(matchError, style: const TextStyle(color: AppColors.red)),
          ...matchResults.map((raw) => _buildDeveloperCard(raw, isMatch: true)),
          if (matchResults.isEmpty && !matchLoading && matchError.isEmpty)
            const Panel(
              child: Text(
                'No candidate matches found for the selected skills.',
                style: TextStyle(color: AppColors.muted),
              ),
            ),
        ],
      );

  Widget _buildSearchTab() => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: q,
                  onSubmitted: (_) => search(),
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search),
                    hintText: 'Search by name, username or skill',
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                onPressed: searchLoading ? null : search,
                icon: const Icon(Icons.search),
              ),
            ],
          ),
          const SizedBox(height: 18),
          if (searchLoading) const Center(child: CircularProgressIndicator()),
          if (searchError.isNotEmpty)
            Text(searchError, style: const TextStyle(color: AppColors.red)),
          ...searchResults
              .map((raw) => _buildDeveloperCard(raw, isMatch: false)),
          if (searchResults.isEmpty && !searchLoading && searchError.isEmpty)
            const Panel(
              child: Text(
                'Search for a developer to view complementary profiles.',
                style: TextStyle(color: AppColors.muted),
              ),
            ),
        ],
      );

  Widget _buildDeveloperCard(dynamic raw, {required bool isMatch}) {
    final m = Map<String, dynamic>.from(raw);
    final user = Map<String, dynamic>.from(m['user'] ?? m['developer'] ?? m);
    final skills = List<dynamic>.from(m['skills'] ?? user['skills'] ?? []);
    final double score =
        (m['score'] ?? m['matchScore'] ?? m['coverage'] ?? 80.0).toDouble();
    final username = '${user['username'] ?? ''}';

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Panel(
        onTap: () {
          if (username.isNotEmpty) {
            Navigator.pushNamed(context, '/u/$username');
          }
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                InitialAvatar(
                  name: '${user['name'] ?? username ?? 'Developer'}',
                  url: '${user['avatarUrl'] ?? ''}',
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${user['name'] ?? username ?? 'Developer'}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      Text(
                        '@$username',
                        style: const TextStyle(color: AppColors.muted),
                      ),
                    ],
                  ),
                ),
                MatchBadge(score: score),
              ],
            ),
            if ('${user['bio'] ?? ''}'.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(
                  '${user['bio']}',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.muted),
                ),
              ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: skills
                  .take(7)
                  .map((s) => SkillPill(s is Map ? '${s['name']}' : '$s'))
                  .toList(),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton.icon(
                  icon: const Icon(Icons.person_outline, size: 16),
                  label: const Text('View Profile'),
                  onPressed: () {
                    if (username.isNotEmpty) {
                      Navigator.pushNamed(context, '/u/$username');
                    }
                  },
                ),
                OutlinedButton.icon(
                  onPressed: () => _invite(
                    context,
                    '${user['_id'] ?? user['id'] ?? ''}',
                    username,
                  ),
                  icon: const Icon(Icons.handshake_outlined, size: 17),
                  label: const Text('Collaborate'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _invite(
    BuildContext context,
    String id,
    String username,
  ) async {
    final controller = TextEditingController(
      text:
          'Hi! I saw your developer profile on DevHub and would love to collaborate with you.',
    );
    final message = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: Text('Invite @$username'),
        content: TextField(
          controller: controller,
          maxLines: 4,
          decoration: const InputDecoration(
            labelText: 'Invitation message',
            hintText: 'Share project details or ideas...',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, controller.text),
            child: const Text('Send Invitation'),
          ),
        ],
      ),
    );
    if (message == null) return;
    try {
      await context.read<DevHubApi>().sendRequest({
        'receiverId': id.isEmpty ? null : id,
        'receiverUsername': username,
        'message': message,
      });
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Collaboration invitation sent to @$username')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }
}
