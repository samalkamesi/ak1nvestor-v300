# R359-notis (2026-10-01 01:45Z)
Deploy-ombygg av känd-good: live-artefakten saknar zcode-rutten sedan 23:01Z (404).
Orsakband: 22:16-fönstret byggde från sjuk byggväg -> artefakt utan zcode -> falskt grön snapshot -> 404 först vid 23:01-restart.
Agenter sviker just nu (Turn failed ~40s) -> denna notis-commit triggar prod-synkens ombygg PÅ känd-good som INNEHÖLL zcode.
v216-commits återfinns i git-reflog. cpus 1->4 + v216 + 10-forskarvågen + z11 = nästa fabrikfönster när API läkt. [organ:Z]
