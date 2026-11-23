import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../state/auth_state.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class RepositoriesScreen extends StatefulWidget {
  const RepositoriesScreen({super.key});

  @override
  State<RepositoriesScreen> createState() => _RepositoriesScreenState();
}

class _RepositoriesScreenState extends State<RepositoriesScreen> {
  String query = '';
  bool pinnedOnly = false;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final repos = auth.repos
        .where((r) =>
            (!pinnedOnly || r.pinned) &&
            r.name.toLowerCase().contains(query.toLowerCase()))
        .toList();

    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Text(
          'My repositories',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: 14),
        TextField(
          decoration: const InputDecoration(
            prefixIcon: Icon(Icons.search),
            hintText: 'Search repositories',
          ),
          onChanged: (v) => setState(() => query = v),
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Pinned only'),
          value: pinnedOnly,
          onChanged: (v) => setState(() => pinnedOnly = v),
          activeThumbColor: AppColors.violet,
        ),
        const SizedBox(height: 8),
        ...repos.map(
          (r) => Padding(
            padding: const EdgeInsets.only(bottom: 11),
            child: Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.folder_open, color: AppColors.sky),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          r.name,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ),
                      IconButton(
                        onPressed: () async {
                          try {
                            await auth.api.updateRepo(
                              r.id,
                              {'isPinned': !r.pinned},
                            );
                            await auth.loadMe();
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(e.toString())),
                              );
                            }
                          }
                        },
                        icon: Icon(
                          r.pinned ? Icons.push_pin : Icons.push_pin_outlined,
                          color: r.pinned ? AppColors.violet : AppColors.muted,
                        ),
                      ),
                    ],
                  ),
                  if (r.description.isNotEmpty)
                    Text(
                      r.description,
                      style: const TextStyle(color: AppColors.muted),
                    ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Text(
                        '★ ${r.stars}',
                        style: const TextStyle(color: AppColors.amber),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        '⑂ ${r.forks}',
                        style: const TextStyle(color: AppColors.muted),
                      ),
                      const Spacer(),
                      if (r.url.isNotEmpty)
                        const Icon(
                          Icons.open_in_new,
                          size: 16,
                          color: AppColors.muted,
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        if (repos.isEmpty)
          const Padding(
            padding: EdgeInsets.all(30),
            child: Text(
              'No repositories match this filter.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.muted),
            ),
          ),
      ],
    );
  }
}
