import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/app_theme.dart';

Future<void> launchExternalUrl(String url) async {
  if (url.trim().isEmpty) return;
  final uri = Uri.parse(url.startsWith('http') ? url : 'https://$url');
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

class GradientButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icon;

  const GradientButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) => Container(
        decoration: BoxDecoration(
          gradient: AppColors.gradient,
          borderRadius: BorderRadius.circular(12),
        ),
        child: ElevatedButton.icon(
          onPressed: loading ? null : onPressed,
          icon: loading
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : Icon(icon ?? Icons.arrow_forward_rounded, size: 18),
          label: Text(label),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            minimumSize: const Size(0, 48),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      );
}

class Panel extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;

  const Panel({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final container = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.line),
      ),
      child: child,
    );
    if (onTap == null) return container;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: container,
    );
  }
}

class SectionTitle extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? trailing;

  const SectionTitle(
    this.title, {
    super.key,
    this.subtitle,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleLarge),
                if (subtitle != null)
                  Text(subtitle!, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          if (trailing != null) trailing!,
        ],
      );
}

class InitialAvatar extends StatelessWidget {
  final String name;
  final String? url;
  final double size;

  const InitialAvatar({
    super.key,
    required this.name,
    this.url,
    this.size = 46,
  });

  @override
  Widget build(BuildContext context) => CircleAvatar(
        radius: size / 2,
        backgroundColor: AppColors.violet,
        backgroundImage: (url != null && url!.startsWith('http'))
            ? NetworkImage(url!)
            : null,
        child: (url == null || url!.isEmpty)
            ? Text(
                name.isEmpty ? 'D' : name[0].toUpperCase(),
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: size * .38,
                  color: Colors.white,
                ),
              )
            : null,
      );
}

class SkillPill extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback? onTap;

  const SkillPill(
    this.label, {
    super.key,
    this.selected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pill = Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
      decoration: BoxDecoration(
        color: selected
            ? AppColors.violet.withOpacity(.22)
            : AppColors.blue.withOpacity(.12),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(
          color: selected
              ? AppColors.violet.withOpacity(.6)
              : AppColors.blue.withOpacity(.28),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          color: selected ? const Color(0xFFD8CCFF) : const Color(0xFFBFDBFE),
          fontWeight: FontWeight.w600,
        ),
      ),
    );
    if (onTap == null) return pill;
    return GestureDetector(onTap: onTap, child: pill);
  }
}

class MatchBadge extends StatelessWidget {
  final double score; // 0 to 100
  const MatchBadge({super.key, required this.score});

  @override
  Widget build(BuildContext context) {
    final rounded = score.round();
    final Color color = rounded >= 75
        ? AppColors.green
        : rounded >= 50
            ? AppColors.amber
            : AppColors.sky;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.auto_awesome, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            '$rounded% match',
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class LoadingView extends StatelessWidget {
  const LoadingView({super.key});

  @override
  Widget build(BuildContext context) => const Center(
        child: CircularProgressIndicator(color: AppColors.violet),
      );
}

class ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback retry;

  const ErrorView({
    super.key,
    required this.message,
    required this.retry,
  });

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off_rounded, size: 42, color: AppColors.muted),
              const SizedBox(height: 12),
              Text(message, textAlign: TextAlign.center),
              const SizedBox(height: 14),
              OutlinedButton(onPressed: retry, child: const Text('Try again')),
            ],
          ),
        ),
      );
}
