import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/devhub_api.dart';
import '../../state/auth_state.dart';
import '../../widgets/devhub_widgets.dart';
import '../../core/app_theme.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final username = TextEditingController();
  final email = TextEditingController();
  final name = TextEditingController();
  final password = TextEditingController();
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
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('API URL set to ${api.baseUrl}')),
                );
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> submit() async {
    setState(() => busy = true);
    try {
      await context.read<AuthState>().register({
        'username': username.text.trim(),
        'email': email.text.trim(),
        'name': name.text.trim(),
        'password': password.text,
      });
      if (mounted) Navigator.pushReplacementNamed(context, '/app');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> verifyGitHub() async {
    final user = username.text.trim();
    if (user.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a GitHub username to verify')),
      );
      return;
    }
    setState(() => busy = true);
    try {
      final api = context.read<DevHubApi>();
      final res = await api.fetchGitHubUser(user);
      final data = res['data'] ?? res;
      final n = data['name'] ?? user;
      final em = data['email'] ?? '';
      final reposCount = data['stats']?['totalRepos'] ?? (data['repos'] as List?)?.length ?? 0;

      if (n.isNotEmpty && (name.text.isEmpty || name.text == user)) {
        name.text = n;
      }
      if (em.isNotEmpty && em.contains('@') && email.text.isEmpty) {
        email.text = em;
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ Verified! Fetched Name: "$n"${em.isNotEmpty ? ", Email: $em" : ""} ($reposCount repos).'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✗ $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('Create account'),
          actions: [
            IconButton(
              icon: const Icon(Icons.dns_outlined),
              tooltip: 'Configure API Server URL',
              onPressed: _showServerUrlDialog,
            ),
          ],
        ),
        body: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(22),
            children: [
              Text(
                'Build your developer identity',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              const Text(
                'Connect a GitHub username to create your living portfolio.',
                style: TextStyle(color: AppColors.muted),
              ),
              const SizedBox(height: 26),
              TextField(
                controller: name,
                decoration: const InputDecoration(labelText: 'Full name'),
              ),
              const SizedBox(height: 13),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: TextField(
                      controller: username,
                      decoration: const InputDecoration(
                        labelText: 'GitHub username',
                        prefixText: '@',
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    height: 56,
                    child: OutlinedButton.icon(
                      onPressed: busy ? null : verifyGitHub,
                      icon: const Icon(Icons.verified_user_outlined, size: 16, color: AppColors.violet),
                      label: const Text('Verify'),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.violet),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 13),
              TextField(
                controller: email,
                decoration: const InputDecoration(labelText: 'Email address'),
              ),
              const SizedBox(height: 13),
              TextField(
                controller: password,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password (minimum 6 characters)',
                ),
              ),
              const SizedBox(height: 22),
              GradientButton(
                label: 'Create account',
                loading: busy,
                onPressed: submit,
              ),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Already have an account? Sign in'),
              ),
            ],
          ),
        ),
      );
}
