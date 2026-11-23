import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/devhub_api.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class PortfolioStudioScreen extends StatefulWidget {
  const PortfolioStudioScreen({super.key});

  @override
  State<PortfolioStudioScreen> createState() => _PortfolioStudioScreenState();
}

class _PortfolioStudioScreenState extends State<PortfolioStudioScreen> {
  final instructions = TextEditingController(
    text: 'Write a concise, confident developer portfolio.',
  );
  bool busy = false;
  Map<String, dynamic>? result;

  @override
  Widget build(BuildContext context) => ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            'AI Portfolio Studio',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 5),
          const Text(
            'Generate a polished portfolio using your developer profile and repository evidence.',
            style: TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 18),
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Creative direction',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: instructions,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    hintText:
                        'Tell the AI how your portfolio should sound and feel',
                  ),
                ),
                const SizedBox(height: 14),
                GradientButton(
                  label: 'Generate portfolio',
                  icon: Icons.auto_awesome,
                  loading: busy,
                  onPressed: () async {
                    setState(() => busy = true);
                    try {
                      result = await context
                          .read<DevHubApi>()
                          .generatePortfolio({'instructions': instructions.text});
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
            ),
          ),
          if (result != null) ...[
            const SizedBox(height: 18),
            const SectionTitle('Generation result'),
            const SizedBox(height: 8),
            Panel(
              child: Text(
                result.toString(),
                style: const TextStyle(color: AppColors.muted),
              ),
            ),
          ],
          const SizedBox(height: 16),
          const Panel(
            child: Text(
              'The API may require a configured Gemini key on the MERN server. This mobile client uses the existing portfolio API and does not introduce a second database.',
              style: TextStyle(color: AppColors.muted, fontSize: 12),
            ),
          ),
        ],
      );
}
