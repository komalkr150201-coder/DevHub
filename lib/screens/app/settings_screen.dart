import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/devhub_api.dart';
import '../../state/auth_state.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool busy = false;

  void _showServerUrlDialog() {
    final api = context.read<DevHubApi>();
    final controller = TextEditingController(text: api.baseUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text('API Server URL'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Backend URL',
            hintText: 'e.g. http://localhost:5001',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              await api.setBaseUrl(controller.text);
              if (mounted) {
                setState(() {});
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('API URL updated to ${api.baseUrl}')),
                );
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final u = auth.user;
    if (u == null) return const LoadingView();
    final privacy = u.privacy;
    final api = context.watch<DevHubApi>();

    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Text('Settings', style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 5),
        const Text(
          'Manage your profile visibility, account, and API connection settings.',
          style: TextStyle(color: AppColors.muted),
        ),
        const SizedBox(height: 20),

        // Privacy Controls
        Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Profile Visibility',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Public Profile'),
                subtitle:
                    const Text('Allow other developers to view your profile'),
                value: privacy['isPublic'] != false,
                activeColor: AppColors.violet,
                onChanged: (v) => _save(auth, {
                  'privacy': {'isPublic': v}
                }),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Show Email'),
                subtitle: const Text(
                  'Display email to accepted collaboration teammates',
                ),
                value: privacy['showEmail'] == true,
                activeColor: AppColors.violet,
                onChanged: (v) => _save(auth, {
                  'privacy': {'showEmail': v}
                }),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Show Private Repositories'),
                value: privacy['showPrivateRepos'] == true,
                activeColor: AppColors.violet,
                onChanged: (v) => _save(auth, {
                  'privacy': {'showPrivateRepos': v}
                }),
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // API Connection Settings
        Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Backend API Server',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 6),
              Text(
                'Current URL: ${api.baseUrl}',
                style: const TextStyle(color: AppColors.muted, fontSize: 13),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Icons.dns_outlined, size: 18),
                label: const Text('Change API Server URL'),
                onPressed: _showServerUrlDialog,
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Account Details
        Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Account Information',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Signed in as @${u.username}',
                style: const TextStyle(color: AppColors.muted),
              ),
              const SizedBox(height: 14),
              OutlinedButton.icon(
                onPressed: busy
                    ? null
                    : () async {
                        setState(() => busy = true);
                        await auth.signOut();
                        if (context.mounted) {
                          Navigator.pushNamedAndRemoveUntil(
                            context,
                            '/',
                            (_) => false,
                          );
                        }
                      },
                icon: const Icon(Icons.logout, color: AppColors.red),
                label: const Text('Sign out of DevHub'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _save(AuthState auth, Map<String, dynamic> data) async {
    try {
      await auth.updateProfile(data);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Settings saved successfully')),
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
